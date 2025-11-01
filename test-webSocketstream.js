/* eslint-disable no-extra-boolean-cast */
import { mynturl, myntappurl, params } from "../../apiurl"
import api from "../../apiurl"
import { logMessage } from "../utils/helpers.js"
import { userid, usession, makeApiRequest } from "./apiConnectionPool"
import { useAppStore } from "../../stores/appStore"
import { useSessionStore } from "../../stores/sessionStore"
import moment from "moment";

console.log("test");
