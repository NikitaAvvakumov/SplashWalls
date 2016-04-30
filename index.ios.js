var NetworkImage = require("react-native-image-progress");
var Progress = require("react-native-progress");
var Swiper = require("react-native-swiper");
var ShakeEvent = require("react-native-shake-event-ios");
var RandManager = require("./RandManager.js");
var Utils = require("./Utils.js");
var ProgressHUD = require("./ProgressHUD.js");

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS,
  Dimensions,
  PanResponder,
  CameraRoll,
  AlertIOS,
} from "react-native";

var {width, height} = Dimensions.get("window");
const NUM_OF_WALLPAPERS = 5;
const DOUBLE_TAP_DELAY = 300; // milliseconds
const DOUBLE_TAP_RADIUS = 20;

class SplashWalls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            wallsJSON: [],
            isLoading: true,
            isHUDVisible: false
        };
        this.imagePanResponder = {};
        this.currentWallpaperIndex = 0;
        this.previousTouchInfo = {
            previousTouchX: 0,
            previousTouchY: 0,
            previousTouchTimeStamp: 0
        };
        this.handlePanResponderGrant = this.handlePanResponderGrant.bind(this);
        this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
    }

    componentWillMount() {
        this.imagePanResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
            onPanResponderGrant: this.handlePanResponderGrant,
            onPanResponderRelease: this.handlePanResponderEnd,
            onPanResponderTerminat: this.handlePanResponderEnd
        });

        ShakeEvent.addEventListener("shake", () => {
            this.initialize();
            this.fetchWallsJSON();
        });
    }

    initialize() {
        this.setState({
            wallsJSON: [],
            isLoading: true,
            isHUDVisible: false
        });

        this.currentWallpaperIndex = 0;
    }

    handleStartShouldSetPanResponder(e, gestureState) {
        return true;
    }

    handlePanResponderGrant(e, gestureState) {
        var currentTouchTimeStamp = Date.now();

        if (this.isDoubleTap(currentTouchTimeStamp, gestureState)) {
            this.saveCurrentWallpaperToCameraRoll();
        }

        this.previousTouchInfo = {
            previousTouchX: gestureState.x0,
            previousTouchY: gestureState.y0,
            previousTouchTimeStamp: currentTouchTimeStamp
        }
    }

    isDoubleTap(currentTouchTimeStamp, {x0, y0}) {
        var {previousTouchX, previousTouchY, previousTouchTimeStamp} = this.previousTouchInfo;
        var timeDelta = currentTouchTimeStamp - previousTouchTimeStamp;
        var temporallyClose = timeDelta < DOUBLE_TAP_DELAY;
        var spatiallyClose = Utils.distance(previousTouchX, previousTouchY, x0, y0) < DOUBLE_TAP_RADIUS;

        return (temporallyClose && spatiallyClose);
    }

    saveCurrentWallpaperToCameraRoll() {
        this.setState({isHUDVisible: true});

        var {wallsJSON} = this.state;
        var currentWallpaper = wallsJSON[this.currentWallpaperIndex];
        var currentWallpaperURL = `https://unsplash.it/${currentWallpaper.width}/${currentWallpaper.height}?image=${currentWallpaper.id}`;

        CameraRoll.saveImageWithTag(currentWallpaperURL)
        .then((data) => {
            this.setState({isHUDVisible: false});
            AlertIOS.alert(
                "Saved",
                "Wallpaper saved to Camera Roll",
                [
                    {text: "Roger", onPress: () => console.log("OK Pressed")}
                ]
            );
        })
        .catch(err => {
            console.log("Error saving to camera roll", err);
        });
    }

    handlePanResponderEnd(e, gestureState) {
        // nothing to do here
    }

    componentDidMount() {
        this.fetchWallsJSON();
    }

    onMomentumScrollEnd(e, state, context) {
        this.currentWallpaperIndex = state.index;
    }

    fetchWallsJSON() {
        var url = "http://unsplash.it/list";
        fetch(url)
            .then(response => response.json())
            .then(jsonData => {
                var randomIds = RandManager.uniqueRandomNumbers(NUM_OF_WALLPAPERS, 0, jsonData.length);
                var walls = [];
                randomIds.forEach(randomId => {
                    walls.push(jsonData[randomId]);
                });
                this.setState({
                    isLoading: false,
                    wallsJSON: [].concat(walls)
                });
            })
            .catch(error => console.log("Fetch error " + error));
    }

    renderLoadingMessage() {
        return(
            <View style={styles.loadingContainer}>
                <ActivityIndicatorIOS
                    animating={true}
                    color={"#fff"}
                    size={"small"}
                    style={{margin: 15}}
                />
                <Text style={{color: "#fff"}}>Contacting Upsplash</Text>
            </View>
        );
    }

    renderResults() {
        var {wallsJSON, isLoading, isHUDVisible} = this.state;
        if (!isLoading) {
            return(
                <View>
                    <Swiper
                    dot={<View style={{backgroundColor:'rgba(255,255,255,.4)', width: 8, height: 8,borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                    activeDot={<View style={{backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}} />}
                    loop={false}
                    index={this.currentWallpaperIndex}
                    onMomentumScrollEnd={this.onMomentumScrollEnd}>
                    {wallsJSON.map((wallpaper, index) => {
                        return(
                            <View key={index}>
                                <NetworkImage
                                source={{uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`}}
                                indicator={Progress.Circle}
                                indicatorProps={{
                                    color: "rgba(255, 255, 255)",
                                    size: 60,
                                    thickness: 7
                                }}
                                style={styles.wallpaperImage}
                                {...this.imagePanResponder.panHandlers}
                                >
                                <Text style={styles.label}>Photo by</Text>
                                <Text style={styles.label_authorName}>{wallpaper.author}</Text>
                                </NetworkImage>
                            </View>
                        );
                    })}
                    </Swiper>
                    <ProgressHUD width={width} height={height} isVisible={isHUDVisible} />
                </View>
            );
        }
    }

    render() {
        var {isLoading} = this.state;
        if (isLoading) {
            return this.renderLoadingMessage();
        } else {
            return this.renderResults();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    loadingContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000"
    },
    wallpaperImage: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: "#000"
    },
    label: {
        position: "absolute",
        color: "#fff",
        fontSize: 13,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 2,
        paddingLeft: 5,
        top: 20,
        left: 20,
        width: width/2
    },
    label_authorName: {
        position: "absolute",
        color: "#fff",
        fontSize: 15,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 2,
        paddingLeft: 5,
        top: 41,
        left: 20,
        fontWeight: "bold",
        width: width/2
    },
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);
