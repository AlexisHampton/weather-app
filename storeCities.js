import { database, } from "./config.js";
import { collection, getDocs, addDoc, Timestamp, doc, setDoc, onSnapshot, where, limit, orderBy, getDoc, query, DocumentReference } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

export default class storeCities {
    cityName = ""; //id
    newsIDs = [];
    //addCity, getCity, 

    constructor(name, weather){
        this.addCity(name, weather);
    }

    async addCity(name, weather)
    {
        console.log(name + " Seokjin");
        const newId = await addDoc(collection(database, "Cities"), {
            cityName: name,
            lat: weather.lat,
            long: weather.long,
            weatherLen: weather.weatherLen,
            temperature: weather.temperature,
            time: weather.time,
            relativeTemp: weather.relativeTemp,
            rain: weather.rain,
            uv_index: weather.uv_index,
            relativehumidity: weather.relativehumidity,
            windspeed: weather.windspeed,
            air_quality: weather.air_quality,
            current_weather: weather.current_weather,
            numStories: weather.numStories,
            current_time: weather.current_time
        
        }).then((doc) => {
            this.cityName = doc;
            console.log(weather.numStories);
            for(let i = 0; i < weather.numStories; i++)
                this.addNewspaper(weather, i);
        });
    }

    async addNewspaper(weather, i)
    {
        let index = "news-" + i;
        const docRef = doc(database, this.cityName.path);
        const colRef = collection(docRef, "Newspapers")
        const newsRef = await addDoc(colRef, {
            title: weather[index]["title"],
            description: weather[index]["description"],
            snippet: weather[index]["snippet"],
            url: weather[index]["url"],
            publisher: weather[index]["publisher"]
        }).then((doc) => {
            this.newsIDs.push(doc);
        });

    }
    static async getCity(cityN)
    {
        console.log(cityN);
        const q = query(
            collection(database, "Cities"),
            where("cityName", "==", cityN)
        );

        let cityDocs = await getDocs(q);
        if(cityDocs.docs.length != 0){
            let curr = new Date().getHours();
            let time = new Date(cityDocs.docs[0].data().current_time).getHours;
            if(curr - time >= 1)
                return undefined;
            else
                return cityDocs.docs[0].id;
        }
        return undefined;
    }

    static async loadCity(cityN)
    {
        const snapShot = await getDoc(doc(database, "Cities", cityN));
        const docRef = doc(database, "Cities", cityN);
        const colRef = collection(docRef, "Newspapers");
        const snap = await getDocs(colRef);
        console.log(snap.docs);
        //console.log(snap.docs[0].id)
        let data = snapShot.data();
        let city = {
            cityName: data.cityName,
            weatherLen: data.weatherLen,
            temperature: data.temperature,
            time: data.time,
            relativeTemp: data.relativeTemp,
            rain: data.rain,
            uv_index: data.uv_index,
            relativehumidity: data.relativehumidity,
            windspeed: data.windspeed,
            air_quality: data.air_quality,
            current_weather: data.current_weather,
            numStories: data.numStories,
            current_time: data.current_time
        };


        for (let i = 0; i < data.numStories; i++) {
            let newsData = snap.docs[i].data();
            city["news-" + i] = newsData;
        }
        console.log("ns: " + data.numStories + " " + city.cityName);
        return city;
    }

}