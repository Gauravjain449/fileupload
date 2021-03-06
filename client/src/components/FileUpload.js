import React, { Fragment, useState } from 'react'
import Message from './Message'
import Progress from './Progress'
import axios from 'axios';

const FileUpload = () => {
    const [file, setFile] = useState('');
    const [filename, setFilename] = useState('Choose File');
    const [uploadedFile, setUploadedFile] = useState({});
    const [message, setMessage] = useState('');
    const [uploadPercentage, setUploadPercentage] = useState(0);


    const OnChange = e => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setFilename(e.target.files[0].name);
        }
    }
    const OnSubmit = async e => {
        e.preventDefault();
        setUploadPercentage(0);
        const formData = new FormData();
        formData.append('file', file);
        // console.log(formData);
        // debugger;
        try {
            const res = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: progressEvent => {

                    setUploadPercentage(parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total)));
                    // Clear Percentage
                    // setTimeout(() => setUploadPercentage(0), 10000);
                }
            });

            const { fileName, filePath } = res.data;
            setUploadedFile({ fileName, filePath });
            setMessage('File Uploaded')
        } catch (err) {
            if (err.response.status === 500) {
                setMessage('There was a problem with the server');
            }
            else {
                setMessage(err.response.data.msg);
            }

        }

    }
    const Onclick = async e => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('/mongoupload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {

                setUploadPercentage(parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total)));
                // Clear Percentage
                // setTimeout(() => setUploadPercentage(0), 10000);
            }
        });
    }
    const OnClickAzure = async e => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('/azuremongoupload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
                console.log(progressEvent.loaded);
                setUploadPercentage(parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total)));
                // Clear Percentage
                // setTimeout(() => setUploadPercentage(0), 10000);
            }
        });
    }
    return (
        <Fragment>
            {message ? <Message msg={message} /> : null}
            <form onSubmit={OnSubmit}>
                <div className="custom-file mb-4">
                    <input type="file" className="custom-file-input" id="customFile" onChange={OnChange} />
                    <label className="custom-file-label" htmlFor="customFile">{filename}</label>
                </div>
                {uploadPercentage > 0 ? <Progress percentage={uploadPercentage} /> : null}
                <input type="submit" value="Upload" className="btn btn-primary btn-block mt-4" />

            </form>
            {uploadedFile ? <div className="row mt-5">
                <div className="col-md-6 m - auto">
                    <h3 className="text-center"> {uploadedFile.fileName} </h3>
                    <img style={{ width: '100%' }} src={uploadedFile.filePath} alt="" />
                </div>
            </div > : null}

            <input type="button" value="mongo check" className="btn btn-primary btn-block mt-4" onClick={Onclick} />
            <input type="button" value="azure mongo check" className="btn btn-primary btn-block mt-4" onClick={OnClickAzure} />
        </Fragment>
    )
}

export default FileUpload
