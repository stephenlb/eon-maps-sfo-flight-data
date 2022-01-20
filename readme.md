# PubNub EON Maps with SFO Flight Data

 1. Clone the repo
 2. Run the docker command to start the SFO flight data server
 3. Launch Map GUI by opening the index.html file or use the share link
 4. **Share Link:** https://stephenlb.github.io/eon-maps-sfo-flight-data/ 

### 1. Clone the Repo
```shell
git clone git@github.com:stephenlb/eon-maps-sfo-flight-data.git
cd eon-maps-sfo-flight-data
```

### 2. Run SFO Flight Data Server

```shell
docker build -t sfo-flight-data . && docker run --init -i -t sfo-flight-data
```

### 3. Launch Map GUI

```shell
open index.html
```

![image](https://user-images.githubusercontent.com/45214/150246040-65d07020-b81c-47f3-bcce-80287872bd90.png)

## Original Reference Code

 - https://github.com/PubNubDevelopers/twitter-stream-sample-feed/blob/c887f318f9be37558b655a2ff513d38a066db31c/app.js#L91-L105
