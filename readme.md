# PubNub EON Maps with SFO Flight Data

 1. Clone the repo
 2. Run the docker command
 3. Open the index.html file

![image](https://user-images.githubusercontent.com/45214/150246040-65d07020-b81c-47f3-bcce-80287872bd90.png)

### Clone the Repo
```shell
git clone git@github.com:stephenlb/eon-maps-sfo-flight-data.git
```

### Run SFO Flight Data Server

```shell
docker build -t sfo-flight-data . && docker run --init -i -t sfo-flight-data
```

### Launch Map GUI

```shell
open index.html
```

## Original Reference Code

 - https://github.com/PubNubDevelopers/twitter-stream-sample-feed/blob/c887f318f9be37558b655a2ff513d38a066db31c/app.js#L91-L105
