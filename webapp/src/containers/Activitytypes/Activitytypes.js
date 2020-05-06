import React from "react";
import axios from "axios";
import Table from "../../components/Datatable/Datatable.js";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import style from "./Activitytypes.module.css";
import { Grid } from "@material-ui/core";
import Input from "../../components/UI/Input/Input";
import auth from "../../components/Auth/Auth.js";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import Modal from "../../components/UI/Modal/Modal.js";
import Switch from "../../components/UI/Switch/Switch";

const useStyles = (theme) => ({
  root: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  buttonRow: {
    height: "42px",
    marginTop: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1,
  },
  addButton: {
    float: "right",
    marginRight: theme.spacing(1),
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
  Districts: {
    marginRight: theme.spacing(1),
  },
  Activitytypes: {
    marginRight: theme.spacing(1),
  },
  Search: {
    marginRight: theme.spacing(1),
  },
  Cancel: {
    marginRight: theme.spacing(1),
  },
});

export class Activitytypes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      filterCountry: "",
      Result: [],
      data: [],
      selectedid: 0,
      open: false,
      isSetActive: false,
      isSetInActive: false,
      isActiveAllShowing: false,
      columnsvalue: [],
      DeleteData: false,
      properties: props,
      isCancel: false,
      dataCellId: [],
      singleDelete: "",
      multipleDelete: "",
      active: {},
      allIsActive: [],
    };
  }

  async componentDidMount() {
    await axios
      .get(process.env.REACT_APP_SERVER_URL + "activitytypes/?_sort=name:ASC", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + "",
        },
      })
      .then((res) => {
        this.setState({ data: res.data });
      });
  }

  StateFilter(event, value, target) {
    this.setState({
      values: { ...this.state.values, [event.target.name]: event.target.value },
    });
  }

  getData(result) {
    for (let i in result) {
      let activitytypes = [];
      for (let j in result[i].activitytypes) {
        activitytypes.push(result[i].activitytypes[j].name + " ");
      }
      result[i]["activitytypes"] = activitytypes;
    }
    return result;
  }

  handleSearch() {
    let searchData = "";
    if (this.state.values.filterCountry) {
      searchData += "name_contains=" + this.state.values.filterCountry;
    }
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "activitytypes?" +
          searchData +
          "&&_sort=name:ASC",
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ data: this.getData(res.data) });
      })
      .catch((err) => {
        console.log("err", err);
      });
  }

  editData = (cellid) => {
    this.props.history.push("/activitytypes/edit/" + cellid);
  };

  cancelForm = () => {
    this.setState({
      filterCountry: "",
      values: {},
      formSubmitted: "",
      stateSelected: false,
      isCancel: true,
    });
    this.componentDidMount();
  };

  DeleteData = (cellid, selectedId) => {
    if (cellid.length !== null && selectedId < 1) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      axios
        .delete(process.env.REACT_APP_SERVER_URL + "activitytypes/" + cellid, {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        })
        .then((res) => {
          this.setState({ singleDelete: res.data.name });
          this.setState({ dataCellId: "" });
          this.componentDidMount();
        })
        .catch((error) => {
          this.setState({ singleDelete: false });
          console.log(error);
        });
    }
  };

  DeleteAll = (selectedId) => {
    if (selectedId.length !== 0) {
      this.setState({ singleDelete: "", multipleDelete: "" });
      for (let i in selectedId) {
        axios
          .delete(
            process.env.REACT_APP_SERVER_URL + "activitytypes/" + selectedId[i],
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + "",
              },
            }
          )
          .then((res) => {
            this.setState({ multipleDelete: true });
            this.componentDidMount();
          })
          .catch((error) => {
            this.setState({ multipleDelete: false });
            console.log("err", error);
          });
      }
    }
  };

  ActiveAll = (selectedId, selected) => {
    if (selectedId.length !== 0) {
      let numberOfIsActive = [];
      for (let i in selected) {
        numberOfIsActive.push(selected[0]["is_active"]);
      }
      this.setState({ allIsActive: numberOfIsActive });
      let IsActive = "";
      if (selected[0]["is_active"] === true) {
        IsActive = false;
      } else {
        IsActive = true;
      }
      for (let i in selectedId) {
        axios
          .put(
            process.env.REACT_APP_SERVER_URL + "activitytypes/" + selectedId[i],
            {
              is_active: IsActive,
            },
            {
              headers: {
                Authorization: "Bearer " + auth.getToken() + "",
              },
            }
          )
          .then((res) => {
            this.setState({ formSubmitted: true });
            this.componentDidMount({ editData: true });
            this.props.history.push({
              pathname: "/activitytypes",
              editData: true,
            });
          })
          .catch((error) => {
            this.setState({ formSubmitted: false });
            if (error.response !== undefined) {
              this.setState({
                errorCode:
                  error.response.data.statusCode +
                  " Error- " +
                  error.response.data.error +
                  " Message- " +
                  error.response.data.message +
                  " Please try again!",
              });
            } else {
              this.setState({ errorCode: "Network Error - Please try again!" });
            }
            console.log(error);
          });
      }
    }
  };

  confirmActive = (event) => {
    this.setState({ isActiveAllShowing: true });
    this.setState({ setActiveId: event.target.id });
    this.setState({ IsActive: event.target.checked });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleActive = (event) => {
    this.setState({ isActiveAllShowing: false });
    let setActiveId = this.state.setActiveId;
    let IsActive = this.state.IsActive;
    axios
      .put(
        process.env.REACT_APP_SERVER_URL + "activitytypes/" + setActiveId,
        {
          is_active: IsActive,
        },
        {
          headers: {
            Authorization: "Bearer " + auth.getToken() + "",
          },
        }
      )
      .then((res) => {
        this.setState({ formSubmitted: true });
        this.setState({ open: true });
        this.componentDidMount({ editData: true });
        this.props.history.push({ pathname: "/activitytypes", editData: true });
      })
      .catch((error) => {
        this.setState({ formSubmitted: false });
        if (error.response !== undefined) {
          this.setState({
            errorCode:
              error.response.data.statusCode +
              " Error- " +
              error.response.data.error +
              " Message- " +
              error.response.data.message +
              " Please try again!",
          });
        } else {
          this.setState({ errorCode: "Network Error - Please try again!" });
        }
        console.log(error);
      });
  };

  closeActiveAllModalHandler = (event) => {
    this.setState({ isActiveAllShowing: false });
  };

  handleCheckBox = (event) => {
    this.setState({ [event.target.name]: event.target.checked });
    this.setState({ addIsActive: true });
  };

  render() {
    let data = this.state.data;
    const Usercolumns = [
      {
        name: "Activity type",
        selector: "name",
        sortable: true,
      },
      {
        name: "Active",
        cell: (cell) => (
          <Switch
            id={cell.id}
            onChange={(e) => {
              this.confirmActive(e);
            }}
            defaultChecked={cell.is_active}
            Small={true}
          />
        ),
        sortable: true,
        button: true,
      },
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
            <h1 className={style.title}>Manage Activity types</h1>
            <div className={classes.row}>
              <div className={classes.buttonRow}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/activitytypes/add"
                >
                  Add Activity type
                </Button>
              </div>
            </div>
            {this.props.location.addData ? (
              <Snackbar severity="success">
                Activity type added successfully.
              </Snackbar>
            ) : null}
            {this.props.location.editData ? (
              <Snackbar severity="success">
                Activity type edited successfully.
              </Snackbar>
            ) : null}
            {this.state.singleDelete !== false &&
            this.state.singleDelete !== "" &&
            this.state.singleDelete ? (
              <Snackbar severity="success" Showbutton={false}>
                Activity type {this.state.singleDelete} deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.singleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === true ? (
              <Snackbar severity="success" Showbutton={false}>
                Activitytypes deleted successfully!
              </Snackbar>
            ) : null}
            {this.state.multipleDelete === false ? (
              <Snackbar severity="error" Showbutton={false}>
                An error occured - Please try again!
              </Snackbar>
            ) : null}
            <br></br>
            <div className={classes.row}>
              <div className={classes.searchInput}>
                <div className={style.Districts}>
                  <Grid item md={12} xs={12}>
                    <Input
                      fullWidth
                      label="Activity type Name"
                      name="filterCountry"
                      variant="outlined"
                      onChange={(event, value) => {
                        this.StateFilter(event, value);
                      }}
                      value={this.state.values.filterCountry || ""}
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
                showSetAllActive={true}
                title={"Activitytypes"}
                showSearch={false}
                filterData={true}
                allIsActive={this.state.allIsActive}
                Searchplaceholder={"Search by Activitytype Name"}
                filterBy={["name"]}
                filters={filters}
                data={data}
                column={Usercolumns}
                editData={this.editData}
                DeleteData={this.DeleteData}
                clearSelected={this.clearSelected}
                DeleteAll={this.DeleteAll}
                handleActive={this.handleActive}
                ActiveAll={this.ActiveAll}
                rowsSelected={this.rowsSelect}
                columnsvalue={columnsvalue}
                DeleteMessage={"Are you Sure you want to Delete"}
                ActiveMessage={
                  "Are you Sure you want to Deactivate selected Activity type"
                }
              />
            ) : (
              <h1>Loading...</h1>
            )}
            <Modal
              className="modal"
              show={this.state.isActiveAllShowing}
              close={this.closeActiveAllModalHandler}
              displayCross={{ display: "none" }}
              handleEventChange={true}
              event={this.handleActive}
              footer={{
                footerSaveName: "OKAY",
                footerCloseName: "CLOSE",
                displayClose: { display: "true" },
                displaySave: { display: "true" },
              }}
            >
              {this.state.IsActive
                ? " Do you want to activate selected activity type ?"
                : "Do you want to deactivate selected activity type ?"}
            </Modal>
          </div>
        </Grid>
      </Layout>
    );
  }
}
export default withStyles(useStyles)(Activitytypes);
