var Swiper = require("react-native-swiper");
var RandManager = require("./RandManager.js");
var NetworkImage = require("react-native-image-progress");
var Progress = require("react-native-progress");

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  ActivityIndicatorIOS,
  Dimensions
} from 'react-native';

var {width, height} = Dimensions.get("window");
const NUM_OF_WALLPAPERS = 5;

class SplashWalls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            wallsJSON: [],
            isLoading: true
        };
    }

    componentDidMount() {
        this.fetchWallsJSON();
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
        var {wallsJSON, isLoading} = this.state;
        if (!isLoading) {
            return(
                <Swiper
                    dot={<View style={{backgroundColor:'rgba(255,255,255,.4)', width: 8, height: 8,borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
                    activeDot={<View style={{backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}} />}
                    loop={false}
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
                                    style={styles.wallpaperImage}>
                                    <Text style={styles.label}>Photo by</Text>
                                    <Text style={styles.label_authorName}>{wallpaper.author}</Text>
                                </NetworkImage>
                            </View>
                        );
                    })}
                </Swiper>
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
