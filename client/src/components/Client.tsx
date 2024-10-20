import React, { useState } from 'react';
import axios from 'axios';

const Client: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileType(selectedFile.type);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const fileName = `${Date.now()}-${file.name}`;
    const fileMimeType = file.type;

    try {
      const response = await axios.post('http://localhost:5000/generate-presigned-url', {
        fileName,
        fileType: fileMimeType,
      });

      const { url } = response.data;
      console.log("Generated PUT URL : ", url);

      await axios.put(url, file, {
        headers: {
          'Content-Type': fileMimeType,
        },
      });

      const fileAccessUrl = url.split('?')[0];
      setFileUrl(fileAccessUrl);
    } catch (error: unknown) {
      console.error("Error uploading file : ", error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Upload to AWS S3 Bucket</h1>
      <input type="file" id="file-input" onChange={handleFileChange} />
      <label htmlFor="file-input" className="custom-file-upload">
        Select File
      </label>
      <button onClick={handleUpload} style={{ margin: '10px' }}>
        Upload File
      </button>
      {file && <h2>{`Selected File: ${file.name}`}</h2>}
      {fileUrl && (
        <div>
          <h2>Uploaded File</h2>
          {fileType?.startsWith('image/') ? (
            <img src={fileUrl} alt="Uploaded File" style={{ maxWidth: '500px', maxHeight: '500px' }} />
          ) : fileType === 'application/pdf' ? (
            <iframe src={fileUrl} width="500" height="500" title="Uploaded PDF" />
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              View Uploaded File
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default Client;