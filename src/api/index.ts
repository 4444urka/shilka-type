import axios from "axios";

const randomWordApiInstance = axios.create({
  baseURL: "https://random-word-api.herokuapp.com/",
});

export default randomWordApiInstance;
