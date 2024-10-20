import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const app = express();

app.use(cors());
app.use(express.json());

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/generate-presigned-url', async (req, res) => {
  const { fileName, fileType } = req.body;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    res.json({ url });
  } catch (err) {
    console.error('Error generating presigned URL', err);
    res.status(500).send('Error generating presigned URL');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
});