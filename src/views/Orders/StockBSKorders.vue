<template>
  <div>
    <!-- Main Basket List Section -->
    <div class="mb-2">
      <!-- Toolbar -->
      <v-toolbar flat dense class="tool-sty my-2 pl-1 crd-trn">
        <v-btn :disabled="!basketStore.canCreateBasket" class="elevation-0 rounded-pill font-weight-bold text-none"
          color="primary" height="40px" variant="elevated" @click="openCreateDialog(true)">
          + Create Basket
        </v-btn>
        <v-spacer></v-spacer>
        <v-text-field elevation="0" rounded v-model="openSearch" prepend-inner-icon="mdi-magnify" placeholder="Search"
          variant="solo" density="compact" hide-details class="rounded mr-4" style="max-width: 220px" flat
          bg-color="secbg"></v-text-field>
        <v-icon :disabled="basketStore.loading" :class="['ml-3 cursor-p', { 'reload-rotating': basketStore.loading }]"
          @click="loadBaskets()" color="maintext" size="24">mdi-reload</v-icon>
      </v-toolbar>

      <!-- Basket Orders Table -->
      <v-data-table @click:row="(event, { item }) => basketStore.openBasket(item)"
        :sort-by="[{ key: 'date', order: 'desc' }]" hide-default-footer fixed-header :loading="basketStore.loading"
        class="holdings-table mt-3 rounded-lg overflow-y-auto"
        style="border-radius: 8px; border: 1px solid #EBEEF0; background-color: #ffffff !important;" height="480px"
        :headers="orderHeaders" :search="openSearch" :items="basketStore.allBaskets" :items-per-page="10"
        :item-class="() => 'table-row'" :row-props="() => ({ class: 'table-row' })">
        <template #item.name="{ item }">
          <span class="font-weight-medium maintext--text ws-p">{{ item.name }}</span>
        </template>
        <template #item.list="{ item }">
          <span class="font-weight-medium maintext--text ws-p">{{ item.list ? item.list.length : 0 }}</span>
        </template>
        <template #item.date="{ item }">
          <span class="font-weight-medium maintext--text ws-p">{{ item.date }}</span>
        </template>
        <template #item.actions="{ item }">
          <div class="d-inline-flex" @click.stop>
            <v-tooltip location="top" color="black">
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn icon size="small" elevation="0" style="background-color: transparent !important;"
                    class="text-align-center mr-1 mt-2" @click="basketStore.openBasket(item)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none">
                      <path
                        d="M5 18.7782C5.00006 18.481 5.11819 18.1959 5.32841 17.9858L17.8214 5.49281C17.9775 5.33658 18.1629 5.21264 18.3669 5.12808C18.571 5.04352 18.7897 5 19.0106 5C19.2315 5 19.4502 5.04352 19.6542 5.12808C19.8583 5.21264 20.0437 5.33658 20.1998 5.49281L23.0972 8.3902C23.2534 8.54634 23.3774 8.73173 23.4619 8.93578C23.5465 9.13983 23.59 9.35854 23.59 9.57942C23.59 9.8003 23.5465 10.019 23.4619 10.2231C23.3774 10.4271 23.2534 10.6125 23.0972 10.7686L10.6042 23.2616C10.3941 23.4718 10.109 23.5899 9.81179 23.59H6.12085C5.82358 23.59 5.53849 23.4719 5.32829 23.2617C5.11809 23.0515 5 22.7664 5 22.4692V18.7782ZM6.12085 18.7782V22.4692H9.81179L22.3047 9.9762C22.3569 9.92414 22.3983 9.8623 22.4266 9.79421C22.4548 9.72613 22.4694 9.65313 22.4694 9.57942C22.4694 9.5057 22.4548 9.43271 22.4266 9.36463C22.3983 9.29654 22.3569 9.2347 22.3047 9.18264L19.4074 6.28525C19.3553 6.23306 19.2935 6.19165 19.2254 6.1634C19.1573 6.13515 19.0843 6.12061 19.0106 6.12061C18.9369 6.12061 18.8639 6.13515 18.7958 6.1634C18.7277 6.19165 18.6659 6.23306 18.6138 6.28525L6.12085 18.7782Z"
                        fill="currentColor" />
                      <path
                        d="M16.3721 7.73451L20.8555 12.2179L21.649 11.4243L17.1657 6.94095L16.3721 7.73451ZM6.28448 17.8221L10.7679 22.3055L11.5614 21.512L7.07804 17.0286L6.28448 17.8221Z"
                        fill="currentColor" />
                      <path d="M18.6138 9.18265L8.52618 19.2703L9.31974 20.0638L19.4074 9.97621L18.6138 9.18265Z"
                        fill="currentColor" />
                    </svg>
                  </v-btn>
                </div>
              </template>
              <span>Edit</span>
            </v-tooltip>

            <v-tooltip location="top" color="black">
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-btn icon size="small" elevation="0" style="background-color: transparent !important;"
                    class="text-align-center mt-2" @click="openDeleteDialog(item)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="24" height="24">
                      <path fill="currentColor" fill-rule="evenodd"
                        d="M11.5 6a.5.5 0 0 0-.5.5V8h6V6.5a.5.5 0 0 0-.5-.5h-5zM18 8V6.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V8H5.5a.5.5 0 0 0 0 1H7v12.5A2.5 2.5 0 0 0 9.5 24h9a2.5 2.5 0 0 0 2.5-2.5V9h1.5a.5.5 0 0 0 0-1H18zm2 1H8v12.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V9zm-8.5 3c.28 0 .5.22.5.5v7a.5.5 0 0 1-1 0v-7c0-.28.22-.5.5-.5zm5.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z">
                      </path>
                    </svg>
                  </v-btn>
                </div>
              </template>
              <span>Delete</span>
            </v-tooltip>
          </div>
        </template>
        <template #no-data>
          <v-col cols="12" class="text-center pa-16">
            <div class="mx-auto">
              <img class="align-self-stretch mx-auto" width="80px" src="@/assets/no data folder.svg" alt="no data" />
              <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
            </div>
          </v-col>
        </template>
      </v-data-table>
    </div>

    <!-- Basket Detail Dialog -->
    <!-- <v-dialog v-model="basketStore.basketDialog" width="760"> -->
    <v-dialog v-model="basketStore.basketDialog" width="760">
      <v-card class="pb-6 px-6 overflow-hidden" style="border-radius: 25px !important;" color="#ffffff">
        <v-list-item-title class="font-weight-bold title maintext--text mt-4 mb-1" style="font-size: 20px !important;">
          Basket order
          <v-icon @click="handleCloseBasket()" class="float-right" color="#000"
            :disabled="basketStore.orderLoader">mdi-close</v-icon>
        </v-list-item-title>
        <v-divider class="mb-2"></v-divider>

        <v-row class="pt-2 pb-4">
          <v-col cols="4" class="d-inline-flex">
            <v-text-field readonly hide-details height="40px" rounded="pill" density="compact" bg-color="#F1F3F8"
              class="rounded-pill mb-0" type="text" variant="flat"
              v-model="basketStore.activeBasket.name"></v-text-field>

            <v-btn icon size="small" elevation="0" width="30px" height="30px" class="text-align-center ml-1 mt-1"
              @click="openCreateDialog(false, basketStore.activeBasket)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path
                  d="M5 18.7782C5.00006 18.481 5.11819 18.1959 5.32841 17.9858L17.8214 5.49281C17.9775 5.33658 18.1629 5.21264 18.3669 5.12808C18.571 5.04352 18.7897 5 19.0106 5C19.2315 5 19.4502 5.04352 19.6542 5.12808C19.8583 5.21264 20.0437 5.33658 20.1998 5.49281L23.0972 8.3902C23.2534 8.54634 23.3774 8.73173 23.4619 8.93578C23.5465 9.13983 23.59 9.35854 23.59 9.57942C23.59 9.8003 23.5465 10.019 23.4619 10.2231C23.3774 10.4271 23.2534 10.6125 23.0972 10.7686L10.6042 23.2616C10.3941 23.4718 10.109 23.5899 9.81179 23.59H6.12085C5.82358 23.59 5.53849 23.4719 5.32829 23.2617C5.11809 23.0515 5 22.7664 5 22.4692V18.7782ZM6.12085 18.7782V22.4692H9.81179L22.3047 9.9762C22.3569 9.92414 22.3983 9.8623 22.4266 9.79421C22.4548 9.72613 22.4694 9.65313 22.4694 9.57942C22.4694 9.5057 22.4548 9.43271 22.4266 9.36463C22.3983 9.29654 22.3569 9.2347 22.3047 9.18264L19.4074 6.28525C19.3553 6.23306 19.2935 6.19165 19.2254 6.1634C19.1573 6.13515 19.0843 6.12061 19.0106 6.12061C18.9369 6.12061 18.8639 6.13515 18.7958 6.1634C18.7277 6.19165 18.6659 6.23306 18.6138 6.28525L6.12085 18.7782Z"
                  fill="currentColor" />
                <path
                  d="M16.3721 7.73451L20.8555 12.2179L21.649 11.4243L17.1657 6.94095L16.3721 7.73451ZM6.28448 17.8221L10.7679 22.3055L11.5614 21.512L7.07804 17.0286L6.28448 17.8221Z"
                  fill="currentColor" />
                <path d="M18.6138 9.18265L8.52618 19.2703L9.31974 20.0638L19.4074 9.97621L18.6138 9.18265Z"
                  fill="currentColor" />
              </svg>
            </v-btn>

            <v-btn icon size="small" elevation="0" width="30px" height="30px" class="text-align-center ml-1 mt-1"
              @click.stop="openDeleteDialog(basketStore.activeBasket)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="24" height="24">
                <path fill="currentColor" fill-rule="evenodd"
                  d="M11.5 6a.5.5 0 0 0-.5.5V8h6V6.5a.5.5 0 0 0-.5-.5h-5zM18 8V6.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V8H5.5a.5.5 0 0 0 0 1H7v12.5A2.5 2.5 0 0 0 9.5 24h9a2.5 2.5 0 0 0 2.5-2.5V9h1.5a.5.5 0 0 0 0-1H18zm2 1H8v12.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V9zm-8.5 3c.28 0 .5.22.5.5v7a.5.5 0 0 1-1 0v-7c0-.28.22-.5.5-.5zm5.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z">
                </path>
              </svg>
            </v-btn>
          </v-col>
          <v-col cols="5" class="ml-auto">
            <v-autocomplete :disabled="(basketStore.selectedScript && basketStore.selectedScript.token)"
              @update:model-value="handleScriptSelect" :loading="basketStore.searchLoading" item-title="tsym"
              return-object height="40px" variant="flat" bg-color="#F1F3F8" density="compact" rounded="pill"
              v-model="basketStore.selectedScript" :search="searchInput" @update:search="handleSearchInput" hide-details
              placeholder="Search script" :items="basketStore.searchItems" prepend-inner-icon="mdi-magnify" clearable
              no-filter>
              <template #item="{ props, item }">
                <v-list-item style="font-size: 12px !important;padding: 0px auto !important;margin: 0px !important;"
                  v-bind="props" :title="item.raw.tsym"></v-list-item>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

        <!-- Order Form Card -->
        <v-card v-if="basketStore.selectedScript && basketStore.selectedScript.token" :loading="basketStore.orderLoader"
          :color="!basketStore.buyOrSell ? '#ECF8F1' : '#ffcdcd90'" class="elevation-0 pt-3 pb-4">
          <v-toolbar class="tool-sty elevation-0 pl-4 pr-2 crd-trn" dense>
            <v-list-item class="px-0">
              <v-list-item-title class="font-weight-bold fs-16 maintext--text mb-0">
                {{ basketStore.selectedScript?.tsym || '' }}
                <span class="ml-1 subtext--text fs-10">{{ basketStore.selectedScript?.exch || '' }}</span>
              </v-list-item-title>
              <v-list-item-subtitle class="font-weight-medium maintext--text">
                <span v-if="basketStore.selectedScript">
                  <!-- Show websocket live data if available, otherwise show cached data -->
                  <template v-if="basketStore.selectedScript.ws && basketStore.selectedScript.ws.lp">
                    ₹<span style="color: #000 !important;">{{ formatPrice(basketStore.selectedScript.ws.lp) }}</span>
                    <span :class="getChangeClass(basketStore.selectedScript.ws.ch)"
                      class="text-right font-weight-medium fs-12">
                      {{ formatPrice(basketStore.selectedScript.ws.ch) }}
                      ({{ formatPrice(basketStore.selectedScript.ws.chp) }}%)
                    </span>
                  </template>
                  <template v-else-if="basketStore.selectedScript.ltp || basketStore.selectedScript.lp">
                    ₹<span>{{ formatPrice(basketStore.selectedScript.ltp || basketStore.selectedScript.lp) }}</span>
                    <span :class="getChangeClass(basketStore.selectedScript.ch)"
                      class="text-right font-weight-medium fs-12">
                      {{ formatPrice(basketStore.selectedScript.ch) }}
                      ({{ formatPrice(basketStore.selectedScript.chp) }}%)
                    </span>
                  </template>
                  <template v-else>
                    ₹<span>0.00</span>
                    <span class="text-right font-weight-medium fs-12 subtext--text">0.00 (0.00%)</span>
                  </template>
                </span>
              </v-list-item-subtitle>
            </v-list-item>
            <v-spacer></v-spacer>
            <v-card class="rounded-md elevation-0 py-1 px-2 font-weight-bold fs-10 white--text mr-4 mt-n5"
              color="#43A833">
              B </v-card>
            <v-switch v-model="basketStore.buyOrSell" inset color="primary"></v-switch>
            <v-card class="rounded-md elevation-0 py-1 px-2 font-weight-bold fs-10 white--text ml-1 mt-n5"
              color="#F23645">
              S </v-card>
            <v-icon @click.stop="clearScriptSelection()" color="#000" class="mb-auto ml-4">mdi-close</v-icon>
          </v-toolbar>

          <v-row no-gutters class="px-4 pb-4">
            <v-col cols="3" class="pb-0 pr-4">
              <p class="font-weight-regular fs-14 subtext--text mb-2">Investment type</p>
              <v-select height="40px" density="compact" bg-color="#ffffff" rounded="pill" variant="flat"
                item-title="txt" item-value="val"
                :items="basketStore.investItems[basketStore.selectedScript.exch === 'NSE' || basketStore.selectedScript.exch === 'BSE' ? 0 : 1]"
                hide-details v-model="basketStore.investType"></v-select>
            </v-col>
            <v-col cols="3" class="pb-0 px-4">
              <p class="font-weight-regular fs-14 subtext--text mb-2">Order type</p>
              <v-select height="40px" density="compact" bg-color="#ffffff" rounded="pill" variant="flat"
                item-title="txt" item-value="val" :items="basketStore.priceItems" hide-details
                v-model="basketStore.priceType"></v-select>
            </v-col>
            <v-col cols="3" class="pb-0 px-4">
              <p class="font-weight-regular fs-14 subtext--text mb-2">
                Quantity <span class="float-right mr-2">MLot: {{ basketStore.selectedScript.ls }}</span>
              </p>
              <v-text-field height="40px" hide-spin-buttons density="compact" bg-color="#ffffff" rounded="pill"
                hide-details class="rounded-pill" variant="flat" type="number"
                :min="Number(basketStore.selectedScript.ls)" :step="Number(basketStore.selectedScript.ls)"
                v-model="basketStore.quantity">
                <template #append-inner>
                  <v-btn style="width: 20px; height: 20px;"
                    @click="basketStore.quantity = Number(basketStore.quantity) + Number(basketStore.selectedScript.ls)"
                    icon size="small" class="elevation-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="white" />
                      <path d="M12 8V16" stroke="#666666" stroke-width="2" stroke-linecap="round" />
                      <path d="M16 12L8 12" stroke="#666666" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </v-btn>
                </template>
                <template #prepend-inner>
                  <v-btn style="width: 20px; height: 20px;"
                    @click="basketStore.quantity == Number(basketStore.selectedScript.ls) ? Number(basketStore.quantity) : (basketStore.quantity = Number(basketStore.quantity) - Number(basketStore.selectedScript.ls))"
                    icon size="small" class="elevation-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="12" fill="white" />
                      <path d="M16 12L8 12" stroke="#666666" stroke-width="2" stroke-linecap="round" />
                    </svg>
                  </v-btn>
                </template>
              </v-text-field>
              <p v-if="securityInfo" class="lh-16 fs-10 subtext--text mb-0">Freeze qty: {{ securityInfo.frzqty }}</p>
            </v-col>
            <v-col v-if="basketStore.priceType === 'LMT' || basketStore.priceType === 'SL-LMT'" cols="3"
              class="pb-0 px-4">
              <p class="font-weight-regular fs-14 subtext--text mb-2">
                Price <span class="float-right mr-2">Tick: {{ basketStore.selectedScript.ti }}</span>
              </p>
              <v-text-field height="40px" hide-spin-buttons density="compact" bg-color="#ffffff" rounded="pill"
                variant="flat" type="number" hide-details :min="basketStore.selectedScript.ti"
                v-model="basketStore.price" @keyup.enter="handleAddItem()" @input="handlePriceInput()">
                <template #prepend-inner>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                      fill="transparent" />
                    <path
                      d="M15.4285 9.25426L15.0805 10.4574H8.58762L8.93066 9.25426H15.4285ZM12.3014 17L8.71689 12.6399L8.70197 11.7102H10.4818C10.9326 11.7102 11.3137 11.6423 11.6253 11.5064C11.9401 11.3705 12.1788 11.1716 12.3412 10.9098C12.5069 10.648 12.5898 10.3232 12.5898 9.93537C12.5898 9.36198 12.4191 8.90956 12.0777 8.57812C11.7363 8.24337 11.2043 8.07599 10.4818 8.07599H8.58762L8.94061 6.81818H10.4818C11.3005 6.81818 11.9733 6.95076 12.5003 7.21591C13.0306 7.47775 13.425 7.84067 13.6835 8.30469C13.942 8.7687 14.0713 9.29901 14.0713 9.8956C14.0713 10.4325 13.9603 10.9214 13.7382 11.3622C13.5194 11.7997 13.1698 12.156 12.6892 12.4311C12.2086 12.7029 11.5756 12.8537 10.79 12.8835L10.7453 12.8935L14.0365 16.9155V17H12.3014ZM15.4285 6.81818L15.0805 8.03125L9.91504 7.99645L10.2631 6.81818H15.4285Z"
                      fill="#666666" />
                  </svg>
                </template>
              </v-text-field>
              <p v-if="securityInfo" class="lh-16 fs-10 subtext--text mb-0">Circuit level: {{ securityInfo.lc }} - {{
                securityInfo.uc }}</p>
            </v-col>
            <v-col v-if="basketStore.priceType === 'SL-MKT' || basketStore.priceType === 'SL-LMT'" cols="3"
              class="pb-0 px-4">
              <p class="font-weight-regular fs-14 subtext--text mb-2">Trigger</p>
              <v-text-field height="40px" hide-spin-buttons density="compact" bg-color="#ffffff" rounded="pill"
                variant="flat" type="number" hide-details :min="basketStore.selectedScript.ti"
                :step="basketStore.selectedScript.ti" v-model="basketStore.triggerPrice" @keyup.enter="handleAddItem()">
                <template #prepend-inner>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z"
                      fill="white" />
                    <path
                      d="M15.4285 9.25426L15.0805 10.4574H8.58762L8.93066 9.25426H15.4285ZM12.3014 17L8.71689 12.6399L8.70197 11.7102H10.4818C10.9326 11.7102 11.3137 11.6423 11.6253 11.5064C11.9401 11.3705 12.1788 11.1716 12.3412 10.9098C12.5069 10.648 12.5898 10.3232 12.5898 9.93537C12.5898 9.36198 12.4191 8.90956 12.0777 8.57812C11.7363 8.24337 11.2043 8.07599 10.4818 8.07599H8.58762L8.94061 6.81818H10.4818C11.3005 6.81818 11.9733 6.95076 12.5003 7.21591C13.0306 7.47775 13.425 7.84067 13.6835 8.30469C13.942 8.7687 14.0713 9.29901 14.0713 9.8956C14.0713 10.4325 13.9603 10.9214 13.7382 11.3622C13.5194 11.7997 13.1698 12.156 12.6892 12.4311C12.2086 12.7029 11.5756 12.8537 10.79 12.8835L10.7453 12.8935L14.0365 16.9155V17H12.3014ZM15.4285 6.81818L15.0805 8.03125L9.91504 7.99645L10.2631 6.81818H15.4285Z"
                      fill="#666666" />
                  </svg>
                </template>
              </v-text-field>
            </v-col>
            <v-col v-if="basketStore.priceType === 'MKT' || basketStore.priceType === 'SL-MKT'" cols="3"
              class="pb-0 px-3">
              <p class="font-weight-regular fs-14 subtext--text mb-2">Market Protection %</p>
              <v-text-field height="40px" hide-spin-buttons density="compact" bg-color="#ffffff" flat hide-details
                class="rounded-pill" variant="flat" rounded="pill" type="number" min="2" max="100" step="1"
                v-model="basketStore.marketProtection" @keyup.enter="handleAddItem()"></v-text-field>
            </v-col>
            <v-col cols="3" class="pb-0">
              <p class="font-weight-regular fs-14 subtext--text">AMO</p>
              <v-checkbox color="#000" v-model="basketStore.afterMarket" class="ma-0 pa-0" hide-details>
                <template #label>
                  <p class="font-weight-regular fs-14 subtext--text  ma-0 pa-0">After Market order</p>
                </template>
              </v-checkbox>
            </v-col>
            <v-col cols="3" class="pb-0 ml-auto mt-auto">
              <v-btn @click="handleAddItem()" :loading="basketStore.orderLoader"
                :color="basketStore.buyOrSell ? '#F23645' : '#43A833'"
                class="text-none rounded-pill elevation-0 white--text py-4" size="small" block>
                <span style="font-size: 14px !important;width: 50px !important;">{{ basketStore.editMode ? "Edit" :
                  "Add"
                }}</span>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <!-- Basket Items Table -->
        <v-data-table v-else :sort-by="[{ key: 'idx', order: 'asc' }]" hide-default-footer fixed-header
          :loading="basketStore.loading" class="mt-0 rounded-lg overflow-y-auto" style="border: 1px solid #EBEEF0"
          height="288px" :headers="basketItemHeaders" :items="basketStore.basketItems" :items-per-page="100">
          <template #item.tsym="{ item }">
            <p class="font-weight-medium maintext--text mb-0 ws-p" style="max-width: 140px !important;">
              {{ item.tsym }}
              <span class="ml-1 txt-999 fs-10">{{ item.exch }}</span>
              <v-list-item-subtitle class="font-weight-medium maintext--text fs-12">
                <!-- Show websocket live data if available and valid, otherwise show cached data -->
                <template v-if="item.ws && item.ws.lp && Number(item.ws.lp) > 0">
                  ₹<span>{{ formatPrice(item.ws.lp) }}</span>
                  <span
                    :style="`color: ${Number(item.ws.ch) > 0 ? '#43A833' : Number(item.ws.ch) < 0 ? '#F23645' : '#666666'}`"
                    class="text-right font-weight-medium fs-10">
                    {{ formatPrice(item.ws.ch) }} ({{ formatPrice(item.ws.chp) }}%)
                  </span>
                </template>
                <template v-else-if="(item.ltp && Number(item.ltp) > 0) || (item.lp && Number(item.lp) > 0)">
                  ₹<span>{{ formatPrice(item.ltp || item.lp) }}</span>
                  <span
                    :style="`color: ${Number(item.ch) > 0 ? '#43A833' : Number(item.ch) < 0 ? '#F23645' : '#666666'}`"
                    class="text-right font-weight-medium fs-10">
                    {{ formatPrice(item.ch) }} ({{ formatPrice(item.chp) }}%)
                  </span>
                </template>
                <template v-else>
                  ₹<span>0.00</span>
                  <span class="text-right font-weight-medium fs-10 subtext--text">0.00 (0.00%)</span>
                </template>
              </v-list-item-subtitle>
            </p>
          </template>
          <template #item.qty="{ item }">
            <v-menu v-if="item.slicetimes" offset-y location="bottom left" open-on-hover>
              <template #activator="{ props }">
                <v-chip v-bind="props" size="small" class="table-hov-prd" text-color="subtext"
                  style="border-radius: 5px; padding: 10px 8px !important">
                  <span class="font-weight-medium maintext--text fs-12">
                    {{ item.qty }} {{ item.slicetimes ? `/ ${Math.round(item.qty / item[0].frzqty) == 1 ? 2 :
                      Math.round(item.qty / item[0].frzqty)}` : '' }}
                  </span>
                </v-chip>
              </template>
              <v-card class="mx-auto text-right overflow-hidden rounded-xl elevation-0" color="transparent"
                width="300px">
                <v-toolbar class="elevation-0 mb-0" color="transparent" dense>
                  <span class="font-weight-bold fs-14">Slice Order</span>
                  <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider class="mb-2"></v-divider>
                <div class="px-4">
                  <v-row class="pb-4">
                    <v-col cols="8" class="text-left">
                      <p class="font-weight-bold fs-14 maintext--text mb-0">
                        {{ item.tsym }}
                        <span class="ml-1 txt-999 fs-10">{{ item.exch }}</span>
                      </p>
                    </v-col>
                    <v-col cols="4" class="text-right">
                      <p class="font-weight-bold fs-14 maintext--text mb-0">
                        {{ item[0].frzqty }} <span class="fs-12 grey--text">x {{ item.slice[0] }}</span>
                      </p>
                    </v-col>
                    <v-col v-if="item.slice[1] > 0" cols="8" class="text-left pb-0">
                      <p class="font-weight-bold fs-14 maintext--text mb-0">
                        {{ item.tsym }}
                        <span class="ml-1 txt-999 fs-10">{{ item.exch }}</span>
                      </p>
                    </v-col>
                    <v-col v-if="item.slice[1] > 0" cols="4" class="text-right">
                      <p class="font-weight-bold fs-14 maintext--text mb-0">
                        {{ item.slice[1] }}
                        <span class="fs-12 grey--text">x 1</span>
                      </p>
                    </v-col>
                  </v-row>
                </div>
              </v-card>
            </v-menu>

            <v-chip v-else size="small" class="table-hov-prd" style="border-radius: 5px; padding: 10px 8px !important">
              <span class="font-weight-medium maintext--text fs-12">{{ item.qty }}</span>
            </v-chip>
          </template>
          <template #item.investype="{ item }">
            <span class="font-weight-medium maintext--text ws-p">{{ basketStore.investItems[item.investype] }}</span>
          </template>
          <template #item.buyrsell="{ item }">
            <v-chip size="small" :color="!item.buyrsell ? '#ECF8F1' : '#ffcdcd90'" variant="tonal"
              :style="`background-color: ${!item.buyrsell ? '#ECF8F1' : '#ffcdcd90'};color: ${!item.buyrsell ? 'green' : 'red'}; border-radius: 5px; padding: 10px 8px !important;`">
              <span class="font-weight-medium fs-12">{{ item.buyrsell ? "SELL" : "BUY" }}</span>
            </v-chip>
          </template>
          <template #item.actions="{ item }">
            <div class="d-inline-flex" @click.stop>
              <v-tooltip location="top" color="black">
                <template #activator="{ props }">
                  <div v-bind="props">
                    <v-btn elevation="0" icon size="small" width="30px" height="30px" color="transparent"
                      class="text-align-center mr-1 mt-2" @click="basketStore.duplicateItem(item)">
                      <v-icon size="18">mdi-content-copy</v-icon>
                    </v-btn>
                  </div>
                </template>
                <span>Duplicate</span>
              </v-tooltip>
              <v-btn elevation="0" icon size="small" width="30px" height="30px" color="transparent"
                class="text-align-center mr-1 mt-2" @click="handleEditItem(item)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M5 18.7782C5.00006 18.481 5.11819 18.1959 5.32841 17.9858L17.8214 5.49281C17.9775 5.33658 18.1629 5.21264 18.3669 5.12808C18.571 5.04352 18.7897 5 19.0106 5C19.2315 5 19.4502 5.04352 19.6542 5.12808C19.8583 5.21264 20.0437 5.33658 20.1998 5.49281L23.0972 8.3902C23.2534 8.54634 23.3774 8.73173 23.4619 8.93578C23.5465 9.13983 23.59 9.35854 23.59 9.57942C23.59 9.8003 23.5465 10.019 23.4619 10.2231C23.3774 10.4271 23.2534 10.6125 23.0972 10.7686L10.6042 23.2616C10.3941 23.4718 10.109 23.5899 9.81179 23.59H6.12085C5.82358 23.59 5.53849 23.4719 5.32829 23.2617C5.11809 23.0515 5 22.7664 5 22.4692V18.7782ZM6.12085 18.7782V22.4692H9.81179L22.3047 9.9762C22.3569 9.92414 22.3983 9.8623 22.4266 9.79421C22.4548 9.72613 22.4694 9.65313 22.4694 9.57942C22.4694 9.5057 22.4548 9.43271 22.4266 9.36463C22.3983 9.29654 22.3569 9.2347 22.3047 9.18264L19.4074 6.28525C19.3553 6.23306 19.2935 6.19165 19.2254 6.1634C19.1573 6.13515 19.0843 6.12061 19.0106 6.12061C18.9369 6.12061 18.8639 6.13515 18.7958 6.1634C18.7277 6.19165 18.6659 6.23306 18.6138 6.28525L6.12085 18.7782Z"
                    fill="currentColor" />
                  <path
                    d="M16.3721 7.73451L20.8555 12.2179L21.649 11.4243L17.1657 6.94095L16.3721 7.73451ZM6.28448 17.8221L10.7679 22.3055L11.5614 21.512L7.07804 17.0286L6.28448 17.8221Z"
                    fill="currentColor" />
                  <path d="M18.6138 9.18265L8.52618 19.2703L9.31974 20.0638L19.4074 9.97621L18.6138 9.18265Z"
                    fill="currentColor" />
                </svg>
              </v-btn>
              <v-btn elevation="0" icon size="small" width="30px" height="30px" color="transparent"
                class="text-align-center mt-2"
                @click.stop="basketStore.removeItemFromBasket(item); basketStore.calculateMargin()">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="24" height="24">
                  <path fill="currentColor" fill-rule="evenodd"
                    d="M11.5 6a.5.5 0 0 0-.5.5V8h6V6.5a.5.5 0 0 0-.5-.5h-5zM18 8V6.5c0-.83-.67-1.5-1.5-1.5h-5c-.83 0-1.5.67-1.5 1.5V8H5.5a.5.5 0 0 0 0 1H7v12.5A2.5 2.5 0 0 0 9.5 24h9a2.5 2.5 0 0 0 2.5-2.5V9h1.5a.5.5 0 0 0 0-1H18zm2 1H8v12.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V9zm-8.5 3c.28 0 .5.22.5.5v7a.5.5 0 0 1-1 0v-7c0-.28.22-.5.5-.5zm5.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z">
                  </path>
                </svg>
              </v-btn>
            </div>
          </template>
          <template #no-data>
            <v-col cols="12" class="text-center pa-16">
              <div class="mx-auto">
                <img class="align-self-stretch mx-auto" width="80px" src="@/assets/no data folder.svg" alt="no data" />
                <h5 class="txt-999 font-weight-regular">There is no data here yet!</h5>
              </div>
            </v-col>
          </template>
        </v-data-table>

        <!-- Margin & Place Order Footer -->
        <v-row class="pt-3">
          <v-col v-if="basketStore.basketMargin.stat !== 'Ok'" cols="8" class="pa-0 pl-1">
            <v-list density="compact" class="crd-trn">
              <v-list-item class="px-0 pl-2">
                <v-list-item-title class="fs-14 font-weight-regular ml-1">
                  Remarks: <span class="error--text fs-14 font-weight-medium">{{ basketStore.basketMargin.emsg || ''
                    }}</span>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col v-else cols="8" class="pa-0 pl-1 d-flex justify-space-between align-center">
            <div class="crd-trn pl-1"
              style="display: flex;align-items: center;justify-content: space-between;width: 80%;">

              <div class="fs-14  font-weight-regular ml-1 text-left">
                Basket Margin: ₹<span class="font-weight-bold">{{ basketStore.totalMargin }}</span>
              </div>
              <div class="fs-14  font-weight-regular text-right">
                Post Trade Margin: ₹<span class="font-weight-bold">{{ basketStore.postTradeMargin }}</span>
              </div>

            </div>
          </v-col>
          <v-col cols="1" class="text-center">
            <v-btn @click="basketStore.calculateMargin()" elevation="0" rounded="pill"
              :disabled="basketStore.orderLoader || (basketStore.selectedScript && basketStore.selectedScript.token)"
              text size="x-small" icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="grey"
                  d="M16.63 7.05a6.78 6.78 0 0 0-11.2 3.29.49.49 0 0 1-.47.37H2.65a.48.48 0 0 1-.48-.57 10 10 0 0 1 16.74-5.37l1.44-1.44A.97.97 0 0 1 22 4v5.4c0 .54-.43.98-.97.98h-5.4a.97.97 0 0 1-.69-1.65l1.69-1.69ZM2.97 13.61h5.4a.97.97 0 0 1 .69 1.66l-1.69 1.68a6.78 6.78 0 0 0 11.2-3.29.49.49 0 0 1 .47-.37h2.31c.3 0 .53.27.48.57a10 10 0 0 1-16.74 5.37l-1.44 1.44A.97.97 0 0 1 2 20v-5.4c0-.54.43-.98.97-.98Z">
                </path>
              </svg>
            </v-btn>
          </v-col>
          <v-col cols="3" class="text-right">
            <v-btn
              :disabled="(basketStore.selectedScript && basketStore.selectedScript.token) || basketStore.basketItems.length === 0"
              :loading="basketStore.orderLoader" color="#000" class="elevation-0 text-capitalize rounded-pill"
              style="color: #fff" @click="basketStore.placeBasketOrder()">
              Place Order
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- Create/Edit Basket Dialog -->
    <v-dialog v-model="showCreateDialog" width="420">
      <v-card class="pb-4 pt-2 px-6 overflow-hidden elevation-0" rounded="lg" color="#ffffff">
        <v-list-item-title class="font-weight-bold title maintext--text mt-2 mb-4" style="font-size: 20px !important;">
          {{ isEditMode ? "Edit" : "Create" }} basket
          <v-icon @click="showCreateDialog = false" class="float-right" color="#000">mdi-close</v-icon>
        </v-list-item-title>
        <p class="font-weight-regular fs-14 subtext--text mb-2">Enter the basket name</p>
        <v-text-field hide-details height="40px" density="compact" bg-color="#F1F3F8" flat rounded="pill"
          class="rounded-pill mb-4" placeholder="my first millions" @keyup.enter="handleCreateOrEdit()" type="text"
          variant="solo" v-model="basketNameInput" @input="handleBasketNameInput"
          :rules="basketNameRules"></v-text-field>
        <v-btn @click="handleCreateOrEdit()" :disabled="!basketNameInput" color="#000" width="100%"
          class="text-none rounded-pill elevation-0 px-6 float-right" style="color: #fff" height="40px">
          {{ isEditMode ? "Edit" : "Create" }}
        </v-btn>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="rounded-xl elevation-0 text-center pt-8 pb-6 overflow-hidden">
        <div class="text-center">
          <img src="@/assets/orderbook/cancel-icon.svg" width="50px" alt="cancel icon" />
        </div>
        <p class="font-weight-medium mt-3 lh-24 mb-8" style="font-size: 22px !important;">
          Are you sure you want to<br />
          delete this <b>{{ deleteTarget ? deleteTarget.name : "" }}</b> basket?
        </p>
        <v-row class="px-6" no-gutters>
          <v-col cols="6" class="px-2">
            <v-btn @click="showDeleteDialog = false; deleteTarget = null" color="outline"
              class="rounded-pill text-none subtext--text font-weight-bold elevation-0" block height="40">No</v-btn>
          </v-col>
          <v-col cols="6" class="px-2">
            <v-btn @click="handleDelete()" color="btnclr"
              class="rounded-pill text-none btntext--text font-weight-bold elevation-0" block height="40">Yes</v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useBasketStore } from '@/stores/basketStore.js'
import { useAuthStore } from '@/stores/authStore.js'
import { useAppStore } from '@/stores/appStore.js'
import { getSecuritydata, getQuotesdata } from '@/components/mixins/getAPIdata.js'

const router = useRouter()
const basketStore = useBasketStore()
const authStore = useAuthStore()
const appStore = useAppStore()

// Local state
const openSearch = ref('')
const searchInput = ref('')
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditMode = ref(false)
const basketNameInput = ref('')
const editTarget = ref(null)
const deleteTarget = ref(null)
const securityInfo = ref(null)

// Basket name validation rules
const basketNameRules = [
  (v) => {
    if (!v || v.trim() === '') return true // Allow empty for now, will be validated on submit
    if (v.includes(' ')) return 'Basket name cannot contain spaces'
    return true
  }
]

function handleBasketNameInput(event) {
  // Remove spaces from input
  const value = event.target.value
  if (value.includes(' ')) {
    basketNameInput.value = value.replace(/\s/g, '')
  }
}

// Table headers
const orderHeaders = computed(() => [
  { title: 'Basket Name', sortable: false, key: 'name' },
  { title: 'No.of item', key: 'list' },
  { title: 'Created on', key: 'date' },
  { title: '', width: '10%', key: 'actions', sortable: false },
])

const basketItemHeaders = computed(() => [
  { title: 'Instrument', key: 'tsym' },
  { title: 'Buy/Sell', key: 'buyrsell' },
  { title: 'Product', key: 'investype' },
  { title: 'Price type', key: 'prctype' },
  { title: 'Qty', key: 'qty', sortable: false },
  { title: 'Price', key: 'price', sortable: false },
  { title: '', width: '10%', key: 'actions', sortable: false },
])

// Methods
function loadBaskets() {
  basketStore.loading = true
  basketStore.loadBaskets()
  setTimeout(() => {
    basketStore.loading = false
  }, 400)
}

function openCreateDialog(createMode, basket = null) {
  isEditMode.value = !createMode
  editTarget.value = basket
  basketNameInput.value = basket ? basket.name : ''
  showCreateDialog.value = true
}

function handleCreateOrEdit() {
  if (!basketNameInput.value || !basketNameInput.value.trim()) {
    appStore.showSnackbar(2, 'Basket name cannot be empty')
    return
  }

  // Validate no spaces
  if (basketNameInput.value.includes(' ')) {
    appStore.showSnackbar(2, 'Basket name cannot contain spaces')
    return
  }

  if (isEditMode.value && editTarget.value) {
    // Edit existing basket
    basketStore.updateBasket(editTarget.value, basketNameInput.value)
    if (basketStore.activeBasket && basketStore.activeBasket.idx === editTarget.value.idx) {
      basketStore.activeBasket.name = basketNameInput.value
    }
  } else {
    // Create new basket
    if (basketStore.createBasket(basketNameInput.value)) {
      const newBasket = basketStore.allBaskets[basketStore.allBaskets.length - 1]
      basketStore.openBasket(newBasket)
    }
  }

  showCreateDialog.value = false
  basketNameInput.value = ''
  editTarget.value = null
}

function openDeleteDialog(basket) {
  deleteTarget.value = basket
  showDeleteDialog.value = true
}

function handleDelete() {
  if (deleteTarget.value) {
    basketStore.deleteBasket(deleteTarget.value)
    basketStore.closeBasket()
  }
  showDeleteDialog.value = false
  deleteTarget.value = null
}

function handleSearchInput(val) {
  searchInput.value = val
  if (val && val.length > 2) {
    basketStore.searchScript(val.toUpperCase())
  }
}

async function handleScriptSelect(script) {
  if (!script || !script.token) return

  // Load security data and quotes data in parallel
  try {
    const secData = `${script.exch}|${script.token}`
    const quoteData = `${script.exch}|${script.token}`

    const [response, quote] = await Promise.all([
      getSecuritydata(secData).catch(() => null),
      getQuotesdata(quoteData).catch(() => null)
    ])

    if (response) {
      securityInfo.value = response

      // Adjust freeze quantity
      if (response.frzqty && Number(response.frzqty) > 0) {
        const fq = Math.round(Number(response.frzqty) / Number(script.ls))
        response.frzqty = fq * Number(script.ls)
      }

      // Merge security data with script
      basketStore.selectedScript['0'] = response
    }

    // Update script with quote data if available
    if (quote) {
      Object.assign(script, {
        lp: quote.lp || quote.ltp || 0,
        ltp: quote.ltp || quote.lp || 0,
        ch: quote.ch || 0,
        chp: quote.chp || 0,
        ls: quote.ls || script.ls || 1,
        ti: quote.ti || script.ti || 0.01,
        lc: quote.lc || script.lc || 0,
        uc: quote.uc || script.uc || 0
      })
    }

    // Initialize ws object with cached data (from quote or script) to show data immediately
    const currentLTP = quote?.lp || quote?.ltp || script.ltp || script.lp || 0
    const currentCH = quote?.ch || script.ch || 0
    const currentCHP = quote?.chp || script.chp || 0

    if (!script.ws) {
      script.ws = {}
    }

    // Set cached data in ws object if available (for immediate display before websocket connects)
    if (currentLTP > 0) {
      script.ws.lp = Number(currentLTP).toFixed(2)
    }
    if (currentCH !== undefined && currentCH !== null) {
      script.ws.ch = Number(currentCH).toFixed(2)
    }
    if (currentCHP !== undefined && currentCHP !== null) {
      script.ws.chp = Number(currentCHP).toFixed(2)
    }

    // Set default values
    basketStore.buyOrSell = false
    basketStore.quantity = Number(script.ls || 1)
    basketStore.investType = 'I'
    basketStore.priceType = 'LMT'

    // Auto-fill price with current LTP if available (prioritize quote data)
    basketStore.price = currentLTP > 0 ? Number(currentLTP).toFixed(2) : 0
    basketStore.triggerPrice = 0
    basketStore.marketProtection = 5
    basketStore.afterMarket = false

    // Mark that price hasn't been manually edited yet
    basketStore.priceManuallyEdited = false

    // Subscribe to WebSocket (will update ws object with live data)
    basketStore.subscribeWebSocket([script])
  } catch (e) {
    // console.error('Error loading security data:', e)
    appStore.showSnackbar(2, 'Failed to load security data')
  }
}

async function handleEditItem(item) {
  // Load security data and quotes data in parallel
  try {
    const secData = `${item.exch}|${item.token}`
    const quoteData = `${item.exch}|${item.token}`

    const [response, quote] = await Promise.all([
      getSecuritydata(secData).catch(() => null),
      getQuotesdata(quoteData).catch(() => null)
    ])

    if (response) {
      securityInfo.value = response

      // Adjust freeze quantity
      if (response.frzqty && Number(response.frzqty) > 0) {
        const fq = Math.round(Number(response.frzqty) / Number(item.ls))
        response.frzqty = fq * Number(item.ls)
      }

      // Merge security data with item
      item['0'] = response
    }

    // Update item with quote data if available
    if (quote) {
      Object.assign(item, {
        lp: quote.lp || quote.ltp || item.lp || 0,
        ltp: quote.ltp || quote.lp || item.ltp || 0,
        ch: quote.ch || item.ch || 0,
        chp: quote.chp || item.chp || 0,
        ls: quote.ls || item.ls || 1,
        ti: quote.ti || item.ti || 0.01,
        lc: quote.lc || item.lc || 0,
        uc: quote.uc || item.uc || 0
      })
    }

    // Initialize ws object with cached data for immediate display
    const currentLTP = quote?.lp || quote?.ltp || item.ltp || item.lp || 0
    const currentCH = quote?.ch || item.ch || 0
    const currentCHP = quote?.chp || item.chp || 0

    if (!item.ws) {
      item.ws = {}
    }

    // Set cached data in ws object if available
    if (currentLTP > 0) {
      item.ws.lp = Number(currentLTP).toFixed(2)
    }
    if (currentCH !== undefined && currentCH !== null) {
      item.ws.ch = Number(currentCH).toFixed(2)
    }
    if (currentCHP !== undefined && currentCHP !== null) {
      item.ws.chp = Number(currentCHP).toFixed(2)
    }

    // Set edit mode
    basketStore.setEditItem(item)
    if (response) {
      basketStore.selectedScript['0'] = response
    }
    basketStore.selectedScript['set'] = true

    // Mark that price hasn't been manually edited yet
    basketStore.priceManuallyEdited = false

    // Subscribe to WebSocket (will update ws object with live data)
    basketStore.subscribeWebSocket([item])
  } catch (e) {
    // console.error('Error loading security data for edit:', e)
    appStore.showSnackbar(2, 'Failed to load security data')
  }
}

function clearScriptSelection() {
  basketStore.selectedScript = null
  basketStore.resetItemForm()
  securityInfo.value = null
}

function handlePriceInput() {
  // Mark that user has manually edited the price
  basketStore.priceManuallyEdited = true
}

function handleCloseBasket() {
  basketStore.closeBasket()
}

// Helper functions for formatting prices safely
function formatPrice(value) {
  if (!value && value !== 0) return "0.00"
  if (typeof value === 'string') {
    const num = Number(value)
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }
  const num = Number(value)
  return isNaN(num) ? "0.00" : num.toFixed(2)
}

function getChangeClass(ch) {
  const num = Number(ch || 0)
  if (num > 0) return 'maingreen--text'
  if (num < 0) return 'mainred--text'
  return 'subtext--text'
}

function roundOffWithInterval(value, interval) {
  return Math.round(value / interval) * interval
}

function handleAddItem() {
  const script = basketStore.selectedScript
  const qty = Number(basketStore.quantity)
  const prc = Number(basketStore.price)
  const trgprc = Number(basketStore.triggerPrice)
  const mktProt = Number(basketStore.marketProtection)
  const sec = securityInfo.value
  const isSell = basketStore.buyOrSell
  const ltp = Number(script.ltp || script.lp || script.ws?.lp || 0)

  if (!sec) {
    appStore.showSnackbar(2, 'Security information not loaded')
    return
  }

  // ========== COMMON QUANTITY VALIDATIONS ==========
  // Quantity must be greater than 0
  if (!(qty > 0)) {
    appStore.showSnackbar(2, 'Quantity must be greater than zero.')
    return
  }

  // Quantity must be a multiple of lot size
  const adjustedQty = Math.round(qty / Number(script.ls)) * Number(script.ls)
  if (qty !== adjustedQty && script.exch !== 'MCX') {
    appStore.showSnackbar(2, `Quantity must be multiple of lot size ${script.ls} => ${adjustedQty > 0 ? adjustedQty : script.ls}`)
    return
  }

  // Check maximum quantity limit (freeze quantity * 40)
  if (sec && sec.frzqty) {
    const maxQty = Number(sec.frzqty) * 40
    if (qty > maxQty) {
      appStore.showSnackbar(2, `Your max slice order limit Quantity is ${maxQty}`)
      return
    }
  }

  // ========== COMMON PRICE VALIDATIONS ==========
  // Price validation for Limit orders (LMT and SL-LMT)
  if (basketStore.priceType === 'LMT' || basketStore.priceType === 'SL-LMT') {
    // Price must be greater than 0
    if (!(prc > 0)) {
      appStore.showSnackbar(2, 'Price must be greater than zero.')
      return
    }

    // Price must be within circuit limits
    const lc = Number(sec.lc || 0)
    const uc = Number(sec.uc || 0)
    if (isFinite(lc) && isFinite(uc) && (prc < lc || prc > uc)) {
      appStore.showSnackbar(2, `Price must be within circuit limits ${lc} - ${uc}`)
      return
    }

    // Price must be a multiple of tick size
    const roundedPrice = roundOffWithInterval(prc, Number(script.ti)).toFixed(2)
    if (prc !== Number(roundedPrice)) {
      appStore.showSnackbar(2, `Price must be multiple of tick size ${script.ti} => ${roundedPrice}`)
      return
    }
  }

  // ========== COMMON MARKET PROTECTION VALIDATIONS ==========
  // Market Protection validation (only for Market orders)
  if (basketStore.priceType === 'MKT' || basketStore.priceType === 'SL-MKT') {
    // Market Protection must be greater than 0
    if (!(mktProt > 0)) {
      appStore.showSnackbar(2, 'Market Protection must be greater than zero')
      return
    }

    // Market Protection must not exceed 20
    if (mktProt > 20) {
      appStore.showSnackbar(2, 'Market Protection cannot exceed 20%')
      return
    }
  }

  // ========== COMMON TRIGGER VALIDATIONS ==========
  // Trigger validation for SL orders (SL-LMT and SL-MKT)
  if (basketStore.priceType === 'SL-LMT' || basketStore.priceType === 'SL-MKT') {
    // Trigger must be greater than 0
    if (!(trgprc > 0)) {
      appStore.showSnackbar(2, 'Trigger price must be greater than zero.')
      return
    }

    // Trigger must be within circuit limits
    const lc = Number(sec.lc || 0)
    const uc = Number(sec.uc || 0)
    if (isFinite(lc) && isFinite(uc) && (trgprc < lc || trgprc > uc)) {
      appStore.showSnackbar(2, `Trigger price must be within circuit limits ${lc} - ${uc}`)
      return
    }

    // Trigger must be a multiple of tick size
    const roundedTrigger = roundOffWithInterval(trgprc, Number(script.ti)).toFixed(2)
    if (trgprc !== Number(roundedTrigger)) {
      appStore.showSnackbar(2, `Trigger price must be multiple of tick size ${script.ti} => ${roundedTrigger}`)
      return
    }

    // ========== BUY/SELL SPECIFIC TRIGGER VALIDATIONS ==========
    if (basketStore.priceType === 'SL-LMT') {
      // SL-LIMIT BUY: Trigger price must be less than Limit price
      // SL-LIMIT SELL: Trigger price must be greater than Limit price
      if (isSell) {
        if (trgprc <= prc) {
          appStore.showSnackbar(2, 'Trigger price must be greater than limit price')
          return
        }
      } else {
        if (trgprc >= prc) {
          appStore.showSnackbar(2, 'Trigger price must be less than limit price')
          return
        }
      }
    } else if (basketStore.priceType === 'SL-MKT') {
      // SL-MARKET BUY: Trigger price must be greater than LTP
      // SL-MARKET SELL: Trigger price must be less than LTP
      if (ltp > 0) {
        if (isSell) {
          if (trgprc >= ltp) {
            appStore.showSnackbar(2, 'Trigger price must be less than LTP')
            return
          }
        } else {
          if (trgprc <= ltp) {
            appStore.showSnackbar(2, 'Trigger price must be greater than LTP')
            return
          }
        }
      }
    }
  }

  // Get current LTP and change values from script (prioritize ws data, then script properties)
  // Check for valid numeric values, not just truthy values
  const getValidLTP = () => {
    const wsLp = script.ws?.lp
    const scriptLtp = script.ltp
    const scriptLp = script.lp

    if (wsLp && Number(wsLp) > 0) return Number(wsLp)
    if (scriptLtp && Number(scriptLtp) > 0) return Number(scriptLtp)
    if (scriptLp && Number(scriptLp) > 0) return Number(scriptLp)
    return null
  }

  const getValidCH = () => {
    const wsCh = script.ws?.ch
    const scriptCh = script.ch
    if (wsCh !== undefined && wsCh !== null && !isNaN(Number(wsCh))) return Number(wsCh)
    if (scriptCh !== undefined && scriptCh !== null && !isNaN(Number(scriptCh))) return Number(scriptCh)
    return null
  }

  const getValidCHP = () => {
    const wsChp = script.ws?.chp
    const scriptChp = script.chp
    if (wsChp !== undefined && wsChp !== null && !isNaN(Number(wsChp))) return Number(wsChp)
    if (scriptChp !== undefined && scriptChp !== null && !isNaN(Number(scriptChp))) return Number(scriptChp)
    return null
  }

  const currentLTP = getValidLTP()
  const currentCH = getValidCH()
  const currentCHP = getValidCHP()

  // Create item object
  const item = {
    ...script,
    slicetimes: qty > Number(sec.frzqty),
    slice: [
      Math.round(qty / Number(sec.frzqty)) === 1 ? 1 : Math.round(qty / Number(sec.frzqty)) - 1,
      qty - (Number(sec.frzqty) * (Math.round(qty / Number(sec.frzqty)) === 1 ? 1 : Math.round(qty / Number(sec.frzqty)) - 1))
    ],
    buyrsell: basketStore.buyOrSell,
    qty: qty,
    idx: basketStore.editMode && basketStore.editItem ? basketStore.editItem.idx : Date.now(),
    investype: basketStore.investType,
    prctype: basketStore.priceType,
    price: prc,
    trgprice: trgprc,
    mktprdordqty: basketStore.marketProtection,
    addmktord: basketStore.afterMarket,
    // Preserve cached data if available, otherwise use script's existing values
    ltp: currentLTP ? currentLTP.toFixed(2) : (script.ltp && Number(script.ltp) > 0 ? Number(script.ltp).toFixed(2) : (script.ltp || '0.00')),
    lp: currentLTP ? currentLTP.toFixed(2) : (script.lp && Number(script.lp) > 0 ? Number(script.lp).toFixed(2) : (script.lp || '0.00')),
    ch: currentCH !== null ? currentCH.toFixed(2) : (script.ch !== undefined && script.ch !== null && !isNaN(Number(script.ch)) ? Number(script.ch).toFixed(2) : (script.ch || '0.00')),
    chp: currentCHP !== null ? currentCHP.toFixed(2) : (script.chp !== undefined && script.chp !== null && !isNaN(Number(script.chp)) ? Number(script.chp).toFixed(2) : (script.chp || '0.00')),
    // Initialize ws object with cached data for immediate display
    ws: currentLTP ? {
      lp: currentLTP.toFixed(2),
      ch: currentCH !== null ? currentCH.toFixed(2) : '0.00',
      chp: currentCHP !== null ? currentCHP.toFixed(2) : '0.00'
    } : (script.ws && script.ws.lp && Number(script.ws.lp) > 0 ? script.ws : {}),
    '0': sec,
  }

  // Add or update item
  if (basketStore.editMode && basketStore.editItem) {
    basketStore.updateItemInBasket(item)
  } else {
    basketStore.addItemToBasket(item)
  }

  // Clear selection and recalculate margin
  clearScriptSelection()
  nextTick(() => {
    basketStore.calculateMargin()
  })
}

// Event handlers
function handleWebSocketData(event) {
  let data = event.detail

  // Handle different websocket data formats
  if (Array.isArray(data) && data.length > 0) {
    data = data[0]?.v || data[0] || data
  } else if (data?.v) {
    data = data.v
  }

  if (data && (data.token || data.tk || data.t)) {
    basketStore.updatePrice(data)
  }
}

function handleOrderbookUpdate(event) {
  const book = event.detail
  if (book === 'bsk') {
    loadBaskets()
  }
}

// Lifecycle
onMounted(() => {
  // Check authentication
  const res = sessionStorage.getItem('c3RhdHVz')
  if (res === 'dmFsaWR1c2Vy') {
    authStore.mtoken = sessionStorage.getItem('msession')
    authStore.uid = sessionStorage.getItem('userid')
    loadBaskets()
  } else {
    router.push('/')
  }

  // Register event listeners
  window.addEventListener('web-scoketConn', handleWebSocketData)
  window.addEventListener('orderbook-update', handleOrderbookUpdate)
})

onUnmounted(() => {
  // Cleanup event listeners
  window.removeEventListener('web-scoketConn', handleWebSocketData)
  window.removeEventListener('orderbook-update', handleOrderbookUpdate)
})

// Watch for basket dialog close
watch(() => basketStore.basketDialog, (newVal) => {
  if (!newVal) {
    clearScriptSelection()
  }
})

// Watch for price type changes - reset manual edit flag so price can auto-update
watch(() => basketStore.priceType, () => {
  basketStore.priceManuallyEdited = false
})
</script>

<style scoped>
.tool-sty {
  background: transparent !important;
}

.crd-trn {
  background: transparent !important;
}

.cursor-p {
  cursor: pointer;
}

.ws-p {
  white-space: pre-wrap;
}

.maintext--text {
  color: #000 !important;
}

.subtext--text {
  color: #666666 !important;
}

.maingreen--text {
  color: #43A833 !important;
}

.mainred--text {
  color: #F23645 !important;
}

.txt-999 {
  color: #999999 !important;
}

.fs-10 {
  font-size: 10px !important;
}

.fs-12 {
  font-size: 12px !important;
}

.fs-14 {
  font-size: 14px !important;
}

.fs-16 {
  font-size: 16px !important;
}

.fs-22 {
  font-size: 22px !important;
}

.lh-16 {
  line-height: 16px !important;
}

.lh-24 {
  line-height: 24px !important;
}

.table-hov-prd {
  cursor: pointer;
}

/* Reload icon rotation animation */
.reload-rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.error--text {
  color: #F23645 !important;
}

:deep(.v-text-field input) {
  font-size: 14px !important;
}

/* Data table header font size */
:deep(.v-data-table thead th),
:deep(.v-data-table table thead th),
:deep(.v-data-table .v-data-table__wrapper table thead th),
:deep(.v-data-table.v-data-table--fixed-header thead th),
:deep(.v-data-table.v-data-table--fixed-header table thead th),
:deep(.holdings-table.v-data-table thead th),
:deep(.holdings-table.v-data-table table thead th),
:deep(.holdings-table.v-data-table .v-data-table__wrapper table thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header thead th),
:deep(.holdings-table.v-data-table.v-data-table--fixed-header table thead th) {
  font-size: 13px !important;
}
</style>
