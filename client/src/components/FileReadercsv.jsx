import React, { Component, Fragment } from 'react';
import { CSVReader } from 'react-papaparse';
import Papa from 'papaparse';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import axios from 'axios';
import MultiDropDown from '../utils/MultiDropDown';
import LoadingOverlay from 'react-loading-overlay';


//import ReactDataGrid from 'react-data-grid';
import MaterialTable from 'material-table';
import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};




class FileUploadCSV extends Component {
    constructor(props) {
        super(props);
        this.OnFilterChange = this.OnFilterChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.fileInput = React.createRef();
        this.state = ({
            isRender: true,
            csvData: [],
            arrFlt: [],
            arrSltFlt: [],
            // columns: { Header: '', accessor: '' },
            columns: { key: '', dataKey: '' },
            data: [],
            optionsData: [],
            arrSltdFlt: [],
            compShouldCount: 0,
            arrFltData: [],
            fade: 'fadeOut',
            StartFileupload: null,
            EndFileupload: null, StartSearch: null, EndSearch: null,
            isLoading: false,
            fileName: ''
        })
    }
    handleFileChange(e) {
        this.setState({ fileName: e.target.files[0].name, isLoading: true })
        let ref = this;
        let _data = [];
        let _filemb = e.target.files[0].size / 1000000;
        Papa.parse(e.target.files[0], {
            worker: _filemb > 50 ? true : false,
            header: true,
            step: function (row) {
                _data.push(row.data);
            },
            complete: function () {
                ref.setState({ csvData: _data, isLoading: false }, () => {
                    console.log(ref.state.csvData);
                })
            }
        });

    }
    testhandleReadCSV = (data) => {

        if (data.data.length === 1) {
            this._data.push(data.data);
            if (this._data.length == 10) {
                this.setState({ isLoading: true });
            }

        }
        else {
            var tempDate = new Date();
            var date = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + ' ' + tempDate.getHours() + ':' + tempDate.getMinutes() + ':' + tempDate.getSeconds();
            const currDate = "Start Time= " + date;
            this.setState({ csvData: this._data, isLoading: false, isRender: true, EndFileupload: currDate }, () => {
                console.log(this.state.csvData);
            })
        }
    }





    handleSubmit = async (e) => {
        e.preventDefault();
        var tempDate = new Date();
        var date = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + ' ' + tempDate.getHours() + ':' + tempDate.getMinutes() + ':' + tempDate.getSeconds();
        const currDate = "Start Time= " + date;
        this.setState({ fade: 'fadeIn', StartSearch: currDate });
        let filemb = this.fileInput.current.files[0].size / 1000000;
        let chunk_size = filemb <= 1.5 ? this.state.data.length
            : (parseInt(this.state.data.length / (filemb * 2)));
        let arrData = []

        for (let index = 0; index < this.state.data.length; index += chunk_size) {
            arrData.push(this.state.data.slice(index, index + chunk_size));
            // Do something if you want with the group

            // var bytes = JSON.stringify(arrData).length;
            // console.log(bytes);

        }
        console.log(arrData.length)
        for (let i = 0; i < arrData.length; i++) {
            await this.getTitle(arrData[i], i).then((res) => {
                console.log(res);
                if (i === arrData.length - 1) {
                    let tempDate = new Date();
                    let date = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + ' ' + tempDate.getHours() + ':' + tempDate.getMinutes() + ':' + tempDate.getSeconds();
                    const currDate = "End Time= " + date;
                    this.setState({ fade: 'fadeOut', EndSearch: currDate });
                }
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!nextState.isRender) {
            return false;
        }
        return true;
    }

    set_ArrSltdFlt = (target) => {
        let { arrSltdFlt } = this.state;
        let index = arrSltdFlt.findIndex((item) => {
            return item.hasOwnProperty(target)
        });
        if (index !== -1) {
            arrSltdFlt = [
                ...arrSltdFlt.slice(0, index),
                ...arrSltdFlt.slice(index + 1)
            ]
        }
        return arrSltdFlt;
    }

    handleSelect = (e) => {
        let { arrSltdFlt, compShouldCount } = this.state;
        compShouldCount = compShouldCount + 1;
        let d = {}
        d[e.target.name] = e.target.value
        arrSltdFlt = this.set_ArrSltdFlt(e.target.name);
        arrSltdFlt.push(d)
        this.setState({ arrSltdFlt, compShouldCount })

    }
    handleSearch = () => {
        let { arrSltdFlt, data, arrFltData } = this.state;
        arrFltData = data.filter((x) => {
            for (let y in arrSltdFlt) {
                if (x[Object.keys(arrSltdFlt[y])[0]] === undefined || x[Object.keys(arrSltdFlt[y])[0]].trim() != Object.values(arrSltdFlt[y])[0].trim())
                    return false;
            }
            return true;
        });
        this.setState({ arrFltData })
        // console.log(arrSltdFlt);
        // console.log(arrFltData);
    }
    OnFilterChange(e) {
        let { arrSltFlt, data, optionsData, arrSltdFlt } = this.state;
        if (e.target.checked) {
            let value = e.target.value;
            arrSltFlt.push(value);
            data.map((rows) => {
                if (optionsData[value].indexOf(rows[value]) === -1) {
                    optionsData[value].push(rows[value]);
                }
            });
        }
        else {
            arrSltFlt = arrSltFlt.filter((item) => item != e.target.value);
        }
        // Check again
        arrSltdFlt = this.set_ArrSltdFlt(e.target.value);
        this.setState({ arrSltFlt, arrSltdFlt });
    }



    handleReadCSV = (rows) => {
        let { arrFlt, columns, data, optionsData } = this.state;
        data = rows.data.slice(0);
        columns = Object.keys(rows.data[0]).map((key, id) => {
            arrFlt.push(key);
            optionsData[key] = [];
            return {
                title: key,
                field: key
            }
        });
        console.log(arrFlt);
        // columns = Object.keys(rows.data[0]).map((key, id) => {
        //     arrFlt.push(key);
        //     optionsData[key] = [];
        //     return {
        //         Header: key,
        //         accessor: key
        //     }
        // });

        // columns.unshift(
        //     {
        //         Header: "EDIT",
        //         id: "FirstIcon",

        //         accessor: data => <p><a title='Edit' className='btn btn-outline-primary' data-toggle="modal">Edit</a></p>
        //     },
        //     {
        //         Header: "Delete",
        //         id: "SecondIcon",

        //         accessor: data => <p><a title='Delete' className='btn btn-outline-danger' data-toggle="modal">Delete</a></p>
        //     }
        // )
        var tempDate = new Date();
        var date = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + ' ' + tempDate.getHours() + ':' + tempDate.getMinutes() + ':' + tempDate.getSeconds();
        const currDate = "End Time= " + date;
        this.setState({
            arrFlt, columns, data, optionsData, EndFileupload: currDate
        })
    }

    getTitle = (data, index) => {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url: 'http://localhost:5000/addrecords', headers: {},
                data: {
                    foo: data,
                    index: index // This is the body part
                }
            }).then(response => {
                return resolve(response.data)
            })
                .catch(error => {
                    return reject(error.message)
                })
        })
    }


    handleOnError = (err, file, inputElem, reason) => {
        console.log(err);
    }

    handleImportOffer = (e) => {
        this.fileInput.current.click();
        var tempDate = new Date();
        var date = tempDate.getFullYear() + '-' + (tempDate.getMonth() + 1) + '-' + tempDate.getDate() + ' ' + tempDate.getHours() + ':' + tempDate.getMinutes() + ':' + tempDate.getSeconds();
        const currDate = "Start Time= " + date;
        // this.setState({
        //     StartFileupload: currDate
        // })

    }
    OnClickABC = () => {
        console.log('ABC');
    }

    render() {
        let _fileName = this.state.fileName === '' ? 'Choose file' : this.state.fileName;
        console.log('Render Call');
        return (
            <LoadingOverlay
                active={this.state.isLoading}
                spinner
                text='Loading your content...'>
                <React.Fragment >

                    <React.Fragment >
                        <div className="custom-file">
                            <input type="file"
                                className="custom-file-input"
                                id="customFile"
                                onChange={this.handleFileChange} />
                            <label className="custom-file-label" htmlFor="customFile">{_fileName}</label>
                        </div>
                        {/* <CSVReader
                            onFileLoaded={this.testhandleReadCSV}
                            inputRef={this.fileInput}
                            style={{ display: 'none' }}
                            onError={this.handleOnError}
                            configOptions={{
                                header: true,
                                step: this.testhandleReadCSV
                            }}

                        /> */}
                        {this.state.StartFileupload}
                        <br />

                        {/* <button onClick={this.handleImportOffer}>Import</button> */}
                        {/* {this.state.isLoading && <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>} */}
                        <br />
                        {this.state.EndFileupload}
                        <hr />
                        {
                            this.state.data.length > 0 &&
                            (
                                <React.Fragment>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text">Choose Filter's </span>
                                        </div>
                                        <MultiDropDown
                                            name="Filters"
                                            id="csvFilters"
                                            divClassName="form-control"
                                            value={this.state.arrSltFlt}
                                            options={this.state.arrFlt}
                                            onChange={this.OnFilterChange}
                                            error=""
                                        />
                                    </div>
                                    <hr />


                                    {this.state.arrSltFlt.map((fltCol, index) => {
                                        return (

                                            <React.Fragment key={fltCol}>

                                                <div className="input-group">
                                                    <div className="input-group-prepend">
                                                        <span className="input-group-text"> {fltCol}</span>
                                                    </div>
                                                    <select name={fltCol} className="form-control" onChange={this.handleSelect}>
                                                        {
                                                            this.state.optionsData[fltCol].length > 0 &&
                                                            this.state.optionsData[fltCol].sort().map((option, i) => {
                                                                return <option key={option} title={option} value={option}>{option}</option>;
                                                            })
                                                        }
                                                    </select>

                                                </div>

                                                <hr />

                                            </React.Fragment>
                                        )
                                    })}

                                    <button onClick={this.handleSearch}>Search</button>

                                    <hr />

                                </React.Fragment>


                            )
                        }
                        {this.state.arrFltData.length > 0 &&
                            (
                                <React.Fragment>

                                    {/* <ReactTable
                                        data={this.state.arrFltData.slice(0,1000)}
                                        columns={this.state.columns}
                                        defaultPageSize={5}
                                        resizable={true}
                                        className="table table-stripped"
                                    /> */}
                                    {/* <ReactDataGrid
                                        columns={this.state.columns}
                                        rowGetter={i => this.state.arrFltData[i]}
                                        rowsCount={this.state.arrFltData.length}
                                        sortable={true}
                                    // minHeight={150} 
                                    /> */}
                                    <MaterialTable
                                        icons={tableIcons}
                                        title=""
                                        columns={this.state.columns}
                                        data={this.state.arrFltData}
                                        editable={{
                                            onRowAdd: newData =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.arrFltData];
                                                        data.push(newData);
                                                        this.setState({ ...this.state, arrFltData: data });
                                                    }, 600);
                                                }),
                                            onRowUpdate: (newData, oldData) =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.arrFltData];
                                                        data[data.indexOf(oldData)] = newData;
                                                        this.setState({ ...this.state, arrFltData: data });
                                                    }, 600);
                                                }),
                                            onRowDelete: oldData =>
                                                new Promise(resolve => {
                                                    setTimeout(() => {
                                                        resolve();
                                                        const data = [...this.state.arrFltData];
                                                        data.splice(data.indexOf(oldData), 1);
                                                        this.setState({ ...this.state, arrFltData: data });
                                                    }, 600);
                                                }),
                                        }}
                                    />
                                    <hr />
                                    {this.state.StartSearch}
                                    <br />
                                    <button onClick={this.handleSubmit}>Submit</button>
                                    <br />
                                    {this.state.EndSearch}
                                </React.Fragment>

                            )}

                    </React.Fragment>
                </React.Fragment>
            </LoadingOverlay>
        );

    }
}

export default FileUploadCSV;