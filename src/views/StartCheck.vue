<template>
    <div class="pt-16">
        <v-row no-gutters>
            <v-col cols="3">
                <v-card class="rounded-0 elevation-0" color="transparent" height="40px">
                    <v-row>
                        <v-col cols="6" class="pr-0">
                            <v-card @click="prc = 'MKT'" :color="prc == 'MKT' ? 'maintext' : 'secbg'"
                                :class="prc == 'MKT' ? 'mainbg--text' : 'maintext--text'"
                                class="elevation-0 fs-12 font-weight-bold rounded-pill rounded-r-0 justify-center d-flex align-center"
                                height="40px">
                                MKT
                            </v-card>
                        </v-col>
                        <v-col cols="6" class="pl-0">
                            <v-card @click="prc = 'LMT'" :color="prc == 'LMT' ? 'maintext' : 'secbg'"
                                :class="prc == 'LMT' ? 'mainbg--text' : 'maintext--text'"
                                class="elevation-0 fs-12 font-weight-bold rounded-pill rounded-l-0 justify-center d-flex align-center"
                                height="40px">
                                LMT
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
            <v-col cols="9">
                <v-text-field :readonly="prc == 'MKT' || prc == 'SL-MKT'" height="40px" hide-details dense
                    background-color="secbg" flat block class="rounded-pill" solo type="number" hide-spin-buttons
                    v-model="ordprice">
                    <template #append>
                        <svg v-if="prc == 'MKT' || prc == 'SL-MKT'" xmlns="http://www.w3.org/2000/svg" width="14"
                            height="14" viewBox="0 0 14 14" fill="none">
                            <path
                                d="M10.0625 4.8125H9.1875V3.0625C9.1875 1.85456 8.20794 0.875 7 0.875C5.79206 0.875 4.8125 1.85456 4.8125 3.0625V4.8125H3.9375V3.0625C3.9375 1.37112 5.30862 0 7 0C8.69137 0 10.0625 1.37112 10.0625 3.0625V4.8125Z"
                                fill="#999999" />
                            <path
                                d="M11.5938 5.6875H2.40625C1.80206 5.6875 1.3125 6.17706 1.3125 6.78125V12.9062C1.3125 13.5104 1.80206 14 2.40625 14H11.5938C12.1979 14 12.6875 13.5104 12.6875 12.9062V6.78125C12.6875 6.17706 12.1979 5.6875 11.5938 5.6875ZM7.4375 10.8754V11.8125C7.4375 12.054 7.2415 12.25 7 12.25C6.7585 12.25 6.5625 12.054 6.5625 11.8125V10.8754C5.62669 10.6339 5.06406 9.67925 5.30556 8.74344C5.54706 7.80763 6.50169 7.245 7.4375 7.4865C8.37331 7.728 8.93594 8.68263 8.69444 9.61844C8.53519 10.2349 8.05394 10.7161 7.4375 10.8754Z"
                                fill="#999999" />
                        </svg>
                    </template>

                    <template #prepend-inner>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                                fill="white" />
                            <path
                                d="M15.4285 9.25426L15.0805 10.4574H8.58762L8.93066 9.25426H15.4285ZM12.3014 17L8.71689 12.6399L8.70197 11.7102H10.4818C10.9326 11.7102 11.3137 11.6423 11.6253 11.5064C11.9401 11.3705 12.1788 11.1716 12.3412 10.9098C12.5069 10.648 12.5898 10.3232 12.5898 9.93537C12.5898 9.36198 12.4191 8.90956 12.0777 8.57812C11.7363 8.24337 11.2043 8.07599 10.4818 8.07599H8.58762L8.94061 6.81818H10.4818C11.3005 6.81818 11.9733 6.95076 12.5003 7.21591C13.0306 7.47775 13.425 7.84067 13.6835 8.30469C13.942 8.7687 14.0713 9.29901 14.0713 9.8956C14.0713 10.4325 13.9603 10.9214 13.7382 11.3622C13.5194 11.7997 13.1698 12.156 12.6892 12.4311C12.2086 12.7029 11.5756 12.8537 10.79 12.8835L10.7453 12.8935L14.0365 16.9155V17H12.3014ZM15.4285 6.81818L15.0805 8.03125L9.91504 7.99645L10.2631 6.81818H15.4285Z"
                                fill="#999999" />
                        </svg>
                    </template>
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <v-text-field v-model="ids" label="Client id" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="8">
                <v-text-field v-model="session" label="session" variant="outlined"></v-text-field>
            </v-col>
        </v-row>
        <v-btn color="primary" :disabled="!ids || !session" @click="setcheckPos(0)"> fetch </v-btn>
        <div class="pt-6">
            <v-row v-for="(q, w, e) in resis" :key="e">
                <v-col cols="2"> {{ w }} ({{ q && q.length > 0 ? q.length : 0 }})</v-col>
                <v-col cols="10" @click="setCopy(q)">{{ q }} </v-col>
            </v-row>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from "axios"

const ids = ref(null)
const session = ref(null)
const prc = ref('LMT')
const ordprice = ref(0)
const resis = ref({
    NorenWClient: {},
    NorenWClientTV: {},
    NorenWClientTP: {},
    NorenWClientWeb: {},
})

const setCheck = () => {
    let config = {
        method: "post",
        url: `https://go.mynt.in/NorenWClientWeb/ValidateHsToken?LoginId=${ids.value.toUpperCase()}&token=7N2mh4VSRt3j0k4Ux3tQMqfv`,
        headers: {
            Cookie: "NWC_ID=66b0fe6554e955199672ffebe90c2e78467be9c1a0a550356be5f3166c328f14",
        },
    }

    axios
        .request(config)
        .then((response) => {
            resis.value = response
        })
        .catch((error) => {
            resis.value = error
            // console.log(error)
        })
}

const setcheckPos = (f) => {
    let data = `jData={"uid":"${ids.value.toUpperCase()}","actid":"${ids.value.toUpperCase()}"}&jKey=${session.value}`

    var point = f == 0 ? "NorenWClient" : f == 1 ? "NorenWClientTV" : f == 2 ? "NorenWClientTP" : f == 3 ? "NorenWClientWeb" : null

    if (f <= 3) {
        let config = {
            method: "post",
            url: `https://go.mynt.in/${point}/PositionBook`,
            data: data,
        }

        axios
            .request(config)
            .then((response) => {
                resis.value[`${point}`] = response.data
                setcheckPos(f + 1)
            })
            .catch((error) => {
                resis.value[`${point}`] = { ...error.response.data }
                setcheckPos(f + 1)
                resis.value = { ...resis.value }
            })
    }
}

const setCopy = (textToCopy) => {
    navigator.clipboard
        .writeText(JSON.stringify(textToCopy))
        .then(() => {
            alert("Text copied to clipboard!")
        })
        .catch((err) => {
            // console.error("Failed to copy text:", err)
        })
}
</script>
