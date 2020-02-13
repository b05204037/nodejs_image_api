# Scale Detection

## Requirement
1. nodejs and npm
2. weights file for scale and put it into ./yolo_py folder
3. conda env with opencv (window recommend to run it on cmd instead of powershell)


```
conda create -n myenv python=3.8.1

conda activate myenv

conda install -c conda-forge opencv
```

## Installing
```bash
git clone https://github.com/b05204037/nodejs_image_api.git

cd nodejs_image_api

npm install && node index.js
```

## Usage
Send and http post request to this backend setting
1. headers   
Content-type : multipart/form-data
2. body  
uploadedFile : Image 