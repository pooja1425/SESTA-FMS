import React from "react";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./States.module.css";
import { Grid } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Input from "../../components/UI/Input/Input";
import auth from "../../components/Auth/Auth.js";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import CustomizedSwitches from "../../components/Switch/Switch";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';

const useStyles = theme => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1)
  },
  buttonRow: {
    height: "42px",
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  addButton: {
    float: "right",
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  },
  Districts: {
    marginRight: theme.spacing(1)
  },
  States: {
    marginRight: theme.spacing(1)
  },
  Search: {
    marginRight: theme.spacing(1)
  },
  Cancel: {
    marginRight: theme.spacing(1)
  }
});

export class Villages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      FilterState: "",
      Result: [],
      TestData: [],
      data: [],
      selectedid: 0,
      open: false,
      isSetActive: false,
      isSetInActive: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      getState: [],
      getDistrict: [],
      getVillage: [],
      isCancel: false,
      dataCellId: [],
      singleDelete: "",
      multipleDelete: "",
      active: {}
    };
  }

  async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "states/?_sort=name:ASC", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        this.setState({ data: res.data });
      });
  }

  StateFilter(event, value, target) {
    this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value }
    });
  }
  getData(result) {
    for (let i in result) {
      let states = [];
      for (let j in result[i].states) {
        states.push(result[i].states[j].name + " ");
      }
      result[i]["states"] = states;
    }
    return result;
  }

  handleSearch() {
    let searchData = "";
    if (this.state.values.FilterState) {
      searchData += "name_contains=" + this.state.values.FilterState;
    }
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
        "states?" +
        searchData +
        "&&_sort=name:ASC",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ data: this.getData(res.data) });
      })
      .catch(err => {
        console.log("err", err);
      });
  }
  editData = cellid => {
    this.props.history.push("/states/edit/" + cellid);
  };

  cancelForm = () => {
    this.setState({
      FilterState: "",
      values: {},
      formSubmitted: "",
      stateSelected: false,
      isCancel: true
    });
    this.componentDidMount();
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      axios
        .delete(process.env.REACT_APP_SERVER_URL + "states/" + cellid, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
          this.setState({ singleDelete: res.data.name });
          this.setState({ dataCellId: "" });
          this.componentDidMount();
        })
        .catch(error => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
    }
  };

  DeleteAll = selectedId => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        axios
          .delete(
            process.env.REACT_APP_SERVER_URL + "states/" + selectedId[i],
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + ""
              }
            }
          )
          .then(res => {
            this.setState({ multipleDelete: true });
            this.componentDidMount();
          })
          .catch(error => {
            this.setState({ multipleDelete: false });
            console.log("err", error);
          });
      }
    }
  };

  handleActive = async (e, target, cellid) => {
    let setActiveId = e.target.id;
    let IsActive = e.target.checked;
    await axios
      .put(
        process.env.REACT_APP_SERVER_URL +
        "states/" +
        setActiveId,
        {
          is_active: IsActive
        },
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        }
      )
      .then(res => {
        this.setState({ formSubmitted: true });
        this.componentDidMount({ editData: true });
        this.props.history.push({ pathname: "/states", editData: true });
      })
      .catch(error => {
        this.setState({ formSubmitted: false });
        if (error.response !== undefined) {
          this.setState({ errorCode: error.response.data.statusCode + " Error- " + error.response.data.error + " Message- " + error.response.data.message + " Please try again!" })
        } else {
          this.setState({ errorCode: "Network Error - Please try again!" });
        }
        console.log(error);
      });
  };

  handleCheckBox = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
    this.setState({ addIsActive: true })
  };

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "State",
        selector: "name",
        sortable: true,
      },
      {
        name: "Active",
        cell: cell => (<Switch id={cell.id} onChange={e => { this.handleActive(e) }} defaultChecked={cell.is_active} Small={true} />),
        sortable: true,
        button: true
      }
    ];

    let selectors = [];
    for (let i in Usercolumns) {
      selectors.push(Usercolumns[i]["selector"]);
    }

    let columnsvalue = selectors[0];
    const { classes } = this.props;
    let filters = this.state.values;
    return (
      <Layout>
        <Grid>
          <div className="App">
            <h1 className={style.title}>Manage States</h1>
            <div className={classes.row}>
              <div className={classes.buttonRow}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/states/add"
                >
                  Add State
                </Button>
              </div>
            </div>
            <br></br>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                State added successfully.
              </Snackbar>
            ) : null}
            {this.props.location.editData ? (
              <Snackbar severity="success">
                State edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
              this.state.singleDelete !== "" &&
              this.state.singleDelete ? (
                <Snackbar severity="success" Showbutton={false}>
                  State {this.state.singleDelete} deleted successfully!
                </Snackbar>
              ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                States deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            <div className={classes.row}>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="State Name"
                      name="FilterState"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.StateFilter(event, value);
                      }}
                      value={this.state.values.FilterState || ""}
                    />
                  </Grid>
                </div>
              </div>
              <div className={classes.searchInput}>
                <Button onClick={this.handleSearch.bind(this)}>Search</Button>
               &nbsp;&nbsp;&nbsp;
              <Button color="secondary" clicked={this.cancelForm}>
                  Reset
              </Button>
              </div>
            </div>
            <br></br>
            {data ? (
              <Table
                title={"States"}
                showSearch={false}
                filterData={true}
                // noDataComponent={"No Records To be shown"}
                Searchplaceholder={"Search by State Name"}
                filterBy={["name"]}
                filters={filters}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                DeleteAll={this.DeleteAll}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue}
                DeleteMessage={"Are you Sure you want to Delete"}
              />
            ) : (
                <h1>Loading...</h1>
              )}
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Villages);