<template>
    <div class="modern-watchlist">
        <!-- Search Header -->
        <div class="search-header">
            <div class="search-container">
                <v-icon class="search-icon">mdi-magnify</v-icon>
                <input v-model="search" @input="onSearchInput" placeholder="Search script"
                    class="search-input rounded-pill" :class="{ 'searching': searchloading }" />
                <v-progress-circular v-if="searchloading" size="16" width="2" indeterminate
                    class="search-loader"></v-progress-circular>
                <v-icon v-if="addscript && !searchloading" @click="onMWClear()" :disabled="isLoading" color="primary"
                    class="search-clear-icon cursor-pointer">mdi-close</v-icon>
            </div>
        </div>

        <!-- Watchlist Toolbar with Tabs -->
        <v-toolbar v-if="!panel && !optchainbasket" flat dense class="tool-sty crd-trn">
            <div ref="watchlistTabsContainer" v-dragscroll.x @mousedown="handleTabsMouseDown"
                @mouseup="handleTabsMouseUp" @mouseleave="handleTabsMouseUp" @mousemove="handleTabsMouseMove"
                style="width: calc(100% - 60px); cursor: grab; user-select: none;"
                class="overflow-x-auto d-inline-flex no-scroll rounded-xl watchlist-tabs-scrollable"
                :class="{ 'dragging': isDraggingTabs }">
                <!-- User Watchlists -->
                <div v-if="!watchsecti" class="d-inline-flex" style="white-space: nowrap;">
                    <div v-for="(wl, index) in watchlist" :key="index" class="pr-2">
                        <v-chip @click.stop="watchlistis = wl; selectWatchlist(wl)" :class="[
                            'font-weight-medium px-3 py-1 watchlisttab',
                            watchlistis === wl ? 'watchlisttab-active' : ''
                        ]" size="medium">
                            {{ wl }}
                        </v-chip>
                    </div>
                </div>
                <!-- Predefined Watchlists -->
                <div v-if="PreMWlist && PreMWlist.length > 0" class="d-inline-flex" style="white-space: nowrap;">
                    <div v-for="(p, s) in PreMWlist" :key="s" class="pr-2">
                        <v-chip @click.stop="watchlistis = p.key; selectWatchlist(p.key)" :class="[
                            'font-weight-medium px-3 watchlisttab',
                            watchlistis === p.key ? 'watchlisttab-active' : ''
                        ]" size="medium">
                            {{ p.text || p.key }}
                        </v-chip>
                    </div>
                </div>
            </div>
            <v-spacer></v-spacer>

            <!-- Sort by Button -->
            <v-menu location="bottom" offset="4">
                <template v-slot:activator="{ props: menuProps }">
                    <v-btn v-bind="menuProps"
                        :disabled="isLoading || !watchlistdata || !Array.isArray(watchlistdata) || watchlistdata.length === 0"
                        class="text-none font-weight-bold ml-2" variant="text"
                        style="border-radius: 8px; text-transform: none; font-weight: 600;">
                        <v-icon size="20">mdi-sort-variant</v-icon>
                    </v-btn>
                </template>
                <v-card density="compact" min-width="100" class="py-2">
                    <div v-for="(item, index) in mwfilters" :key="index" @click="mwfilter = item.key; setMWfilter()"
                        :class="mwfilter === item.key ? 'primary--text bg-primary-lighten-5' : ''"
                        class="px-4 py-2 cursor-pointer">
                        <p :class="mwfilter === item.key ? 'font-weight-bold' : ''"
                            style="font-size: 12px !important;font-weight: 600 !important;padding-block: 2px !important;">
                            {{ item.text }}
                        </p>
                        <v-icon v-if="mwfilter === item.key" color="primary" size="small">mdi-check</v-icon>
                    </div>
                </v-card>
            </v-menu>

            <!-- Action Buttons -->
            <v-tooltip location="left" color="black">
                <template v-slot:activator="{ props }">
                    <div v-bind="props">
                        <v-icon v-if="watchsecti" @click="createMWdialog = true"
                            :disabled="(watchlist && watchlist.length >= 10) || isLoading"
                            color="maintext">mdi-plus</v-icon>
                    </div>
                </template>
                <span>
                    {{ watchlist && watchlist.length >= 10 ? "Maximum 10 watchlists You can create."
                        : "Create new watchlist" }}</span>
            </v-tooltip>
            <v-icon @click="(addscript = false), (watchsecti = !watchsecti)" :disabled="isLoading" color="maintext"
                class="ml-2">
                {{ !watchsecti ? 'mdi-dots-vertical' : 'mdi-chevron-left' }}
            </v-icon>
        </v-toolbar>

        <!-- Watchlist Management Section -->
        <v-card v-if="watchsecti" class="elevation-0 rounded-xl mb-3" color="cardbg">

            <!-- <v-card-title class="pb-2">
                <span class="title font-weight-bold">Manage Watchlists</span>
                <v-spacer></v-spacer>
                <v-btn @click="createMWdialog = true" color="primary" small>
                    <v-icon left>mdi-plus</v-icon>
                    New Watchlist
                </v-btn>
            </v-card-title> -->
            <v-list>
                <div v-for="(wl, index) in watchlist" :key="index" @click="selectWatchlist(wl); watchsecti = false"
                    class="cursor-pointer watchlist-manage-item" :class="{ 'active': wl === watchlistis }"
                    style="display: flex;align-items: center;justify-content: space-between;">
                    <div style="display: flex;align-items: center;">

                        <div class="watchlist-indicator">
                            <div class="indicator-square" :class="wl === watchlistis ? 'active' : ''">
                            </div>
                        </div>


                        <div class="pl-3">
                            <p class="watchlist-name" :class="wl === watchlistis ? 'font-weight-bold' : ''">
                                {{ wl }}
                            </p>
                        </div>
                    </div>

                    <div class="mr-2">
                        <v-btn @click.stop="confirmDeleteWatchlist(wl)" icon size="small" variant="text"
                            class="delete-btn">
                            <v-icon size="30" color="maintext">mdi-delete-outline</v-icon>
                        </v-btn>
                    </div>
                </div>
            </v-list>

        </v-card>

        <!-- Options Chain Basket Section -->
        <div v-if="optchainbasket" class="options-basket-section">
            <v-toolbar flat density="compact" class="tool-sty crd-trn pl-1">
                <p class="font-weight-bold mb-0 lh-16">Basket Options({{ optchainbasketdata.length }})</p>
                <v-spacer></v-spacer>
                <v-card color="secbg" class="px-2 py-0 elevation-0 rounded-xl">
                    <v-switch hide-details v-model="prdordplace" density="compact" class="mt-n01">
                        <template #label>
                            <p class="pl-1 fw-6 fs-13 maintext--text mb-0 pt-1">{{ prdordplace ? " MIS" : " NRML" }}</p>
                        </template>
                    </v-switch>
                </v-card>

                <v-btn class="mr-0" size="small" icon @click="optchainbasket = false">
                    <v-tooltip location="top" color="black">
                        <template v-slot:activator="{ props }">
                            <v-icon v-bind="props">mdi-minus</v-icon>
                        </template>
                        <span>Minimize</span>
                    </v-tooltip>
                </v-btn>

                <v-btn class="mr-0" size="small" icon @click="(optchainbasket = false), (optchainbasketdata = [])">
                    <v-tooltip location="top" color="black">
                        <template v-slot:activator="{ props }">
                            <v-icon v-bind="props">mdi-close</v-icon>
                        </template>
                        <span>Close</span>
                    </v-tooltip>
                </v-btn>
            </v-toolbar>
            <v-divider></v-divider>

            <!-- Basket Items List -->
            <div v-if="optchainbasketdata && optchainbasketdata.length > 0" style="height: calc(100vh - 124px)"
                class="overflow-y-auto overflow-x-hidden no-scroll">
                <div v-for="(item, o) in optchainbasketdata" :key="o" class="pt-2 px-1">
                    <p class="maintext--text mb-0 fs-13">
                        <v-icon @click="(item.checkbox = !item.checkbox), getOBMargin()" color="primary" size="14">
                            {{ !item.checkbox ? "mdi-checkbox-blank-outline" : "mdi-checkbox-marked" }}
                        </v-icon>
                        <span class="table-hov-text">{{ item.tsyms ? item.tsyms : item.tsym ? item.tsym : '' }}</span>
                        <span class="subtext--text">{{ item.exp ? item.exp : '' }}</span>
                        <span class="subtext--text fs-10">{{ item.ser ? item.ser : '' }}</span>
                        <span class="float-right maintext--text fs-13">
                            <v-icon @click="setBskmodify(o, 'delete')" color="maintext" class="font-weight-bold"
                                size="16">
                                mdi-close
                            </v-icon>
                        </span>
                    </p>

                    <v-row no-gutters>
                        <v-col cols="3" class="px-1 pt-2">
                            <v-tooltip location="top" color="black">
                                <template v-slot:activator="{ props }">
                                    <v-btn-toggle v-bind="props" v-model="item.buySell" mandatory density="compact"
                                        class="elevation-0 rounded-lg"
                                        @update:model-value="setBskmodify(o, 'buySell', item.buySell); getOBMargin()">
                                        <v-btn value="BUY" size="x-small" :disabled="!item.checkbox"
                                            :color="item.buySell == 'BUY' ? 'maingreen' : 'secbg'"
                                            :class="item.buySell == 'BUY' ? 'white--text' : 'maintext--text'">
                                            BUY
                                        </v-btn>
                                        <v-btn value="SELL" size="x-small" :disabled="!item.checkbox"
                                            :color="item.buySell == 'SELL' ? 'mainred' : 'secbg'"
                                            :class="item.buySell == 'SELL' ? 'white--text' : 'maintext--text'">
                                            SELL
                                        </v-btn>
                                    </v-btn-toggle>
                                </template>
                                <span>Buy/Sell</span>
                            </v-tooltip>
                        </v-col>

                        <v-col cols="3" class="px-1 pt-2">
                            <v-tooltip location="top" color="black">
                                <template v-slot:activator="{ props }">
                                    <v-btn-toggle v-bind="props" v-model="item.ordvai" mandatory density="compact"
                                        class="elevation-0 rounded-lg"
                                        @update:model-value="setBskmodify(o, 'ordvai', item.ordvai); getOBMargin()">
                                        <v-btn value="MKT" size="x-small" :disabled="!item.checkbox"
                                            :color="item.ordvai == 'MKT' ? 'primary' : 'secbg'"
                                            :class="item.ordvai == 'MKT' ? 'white--text' : 'maintext--text'">
                                            MKT
                                        </v-btn>
                                        <v-btn value="LMT" size="x-small" :disabled="!item.checkbox"
                                            :color="item.ordvai == 'LMT' ? 'primary' : 'secbg'"
                                            :class="item.ordvai == 'LMT' ? 'white--text' : 'maintext--text'">
                                            LMT
                                        </v-btn>
                                    </v-btn-toggle>
                                </template>
                                <span>Market/Limit</span>
                            </v-tooltip>
                        </v-col>

                        <v-col cols="3" class="px-1 pt-2">
                            <v-tooltip location="top" color="black">
                                <template v-slot:activator="{ props }">
                                    <v-text-field v-bind="props" :disabled="!item.checkbox" @keyup="getOBMargin()"
                                        prefix="📦" class="fs-12 bskfield" height="20px" v-model="item.ordlot"
                                        type="number" min="1" hide-spin-buttons hide-details density="compact"
                                        variant="outlined"></v-text-field>
                                </template>
                                <span>QTY: {{ item.ordlot }} * MLot {{ item.ls }}</span>
                            </v-tooltip>
                        </v-col>

                        <v-col cols="3" class="px-1 pt-2">
                            <v-tooltip location="top" color="black">
                                <template v-slot:activator="{ props }">
                                    <v-text-field v-bind="props" @keyup="getOBMargin()" prefix="₹"
                                        :disabled="item.ordvai == 'MKT' || !item.checkbox" class="fs-12 bskfield"
                                        height="20px" v-model="item.ordprc" type="number" min="0.1" hide-spin-buttons
                                        hide-details density="compact" variant="outlined"></v-text-field>
                                </template>
                                <span>Price</span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                    <v-divider class="mt-1"></v-divider>
                </div>
            </div>

            <v-card v-else class="text-center py-16 px-8 elevation-0 crd-trn" width="100%">
                <img class="align-self-stretch mx-auto" width="70px" src="/src/assets/searcha-icon.svg" />
                <p class="subtext--text fs-14 mb-1">Hmmm, Looks like no Strikes — why not add some? Choose from the
                    option
                    chain.</p>
            </v-card>

            <!-- Margin & Place Order Section -->
            <div v-if="optchainbasketdata && optchainbasketdata.length > 0">
                <v-divider></v-divider>
                <v-toolbar class="tool-sty elevation-0 crd-trn pt-1 pl-1" density="compact">
                    <v-list-item class="px-0">
                        <v-list-item-title class="font-weight-medium fs-12 subtext--text mb-2">
                            Margin:
                            <span class="ml-1 primary--text">
                                <b>₹{{ Number(totalmargin) ? totalmargin.toFixed(2) : "0.00" }}</b>
                            </span>
                            <v-icon class="ml-1 cursor-p" @click="getOBMargin()" color="maintext" size="12">
                                mdi-reload
                            </v-icon>
                        </v-list-item-title>
                        <v-list-item-title class="font-weight-medium fs-12 subtext--text mb-0">
                            Post margin:
                            <span class="ml-1 primary--text">
                                <b>₹{{ Number(postTrademargin) ? postTrademargin.toFixed(2) : "0.00" }}</b>
                            </span>
                        </v-list-item-title>
                    </v-list-item>
                    <v-spacer></v-spacer>
                    <v-btn @click="setBfoPlaceorder(0)" color="primary" :loading="orderloader"
                        class="text-none rounded-pill elevation-0 white--text px-6" height="40px">
                        Place order
                    </v-btn>
                </v-toolbar>
            </div>
        </div>

        <!-- Floating Basket Button (when minimized) -->
        <div v-if="!optchainbasket && optchainbasketdata && optchainbasketdata.length > 0" class="pos-abs"
            style="bottom: 0; right: 0">
            <v-btn @click="optchainbasket = true" color="primary" icon="true" variant="elevated">
                <v-badge :content="optchainbasketdata.length" color="warning">
                    <img width="24px" src="/src/assets/usermenu/9d.svg" />
                </v-badge>
            </v-btn>
        </div>

        <!-- Mutual Fund Section (when panel is true) -->
        <div v-if="panel && !optchainbasket" class="mutual-fund-section">
            <!-- Mutual Fund Search -->
            <v-text-field v-model="mfsearch" :loading="searchloading" ref="mwref"
                class="rounded-pill mt-2 mf-search-input" variant="outlined" density="compact" :bg-color="'secbg'"
                @input="handleMFSearchInput"
                @click="(addscript = true), (watchsecti = false), (mfwatchlistdata = []), (nodata = null), putMWfocus()"
                label="Search funds" prepend-inner-icon="mdi-magnify" hide-details>
                <template v-if="addscript" v-slot:append>
                    <v-icon :disabled="isLoading" @click="onMWClear()" color="primary" class="mr-1">mdi-close</v-icon>
                </template>
            </v-text-field>

            <!-- Mutual Fund Toolbar -->
            <v-toolbar v-if="!addscript" flat density="compact" class="tool-sty crd-trn">
                <v-btn variant="text" readonly
                    class="elevation-0 rounded-lg text-none fs-14 d-inline-flex px-2 text-capitalize" max-width="220px">
                    My watchlist
                    <span class="ml-2 font-weight-bold fs-12">({{ mfuseritem ? mfuseritem.length : "0" }})</span>
                </v-btn>
                <v-spacer></v-spacer>

                <!-- Sort Menu -->
                <v-tooltip location="top" color="black">
                    <template v-slot:activator="{ props }">
                        <div v-bind="props">
                            <v-menu location="bottom">
                                <template v-slot:activator="{ props: menuProps }">
                                    <div v-bind="menuProps">
                                        <v-icon v-if="!watchsecti && !addscript" :disabled="mfisLoading"
                                            color="maintext" class="mr-1">mdi-flip-h mdi-sort-variant</v-icon>
                                    </div>
                                </template>
                                <v-list density="compact">
                                    <v-list-item v-for="(item, index) in mffilters" :key="index"
                                        @click="mffilter = index; setMFFilter()">
                                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </template>
                    <span>Sort by</span>
                </v-tooltip>

                <v-icon v-if="!watchsecti && !addscript" :disabled="mfisLoading"
                    @click="(addscript = true), (watchsecti = false), (mfwatchlistdata = []), (nodata = null), putMWfocus()"
                    color="maintext">mdi-magnify</v-icon>
            </v-toolbar>

            <!-- Mutual Fund Search Results Header -->
            <div v-if="addscript">
                <v-divider></v-divider>
                <div v-if="mfwatchlistdata && mfwatchlistdata.length > 0">
                    <p class="subtext--text fs-14 mt-2 mb-1">{{ mfwatchlistdata.length }} search result by you</p>
                    <v-divider></v-divider>
                </div>
            </div>

            <v-progress-linear v-if="mfisLoading" indeterminate rounded></v-progress-linear>
            <v-divider v-if="!watchsecti && !addscript"></v-divider>

            <!-- Mutual Fund List -->
            <div v-if="!addscript" style="height: calc(100vh - 172px)"
                class="overflow-y-auto overflow-x-hidden no-scroll">
                <div v-if="mfuseritem && mfuseritem.length > 0">
                    <v-card v-for="(item, o) in mfuseritem" :key="o"
                        class="elevation-0 rounded-0 table-row overflow-hidden crd-trn">
                        <div class="table-row pos-rlt">
                            <v-list-item class="pa-0 py-1">
                                <v-list-item-title class="fs-13 font-weight-medium mb-1 maintext--text table-hov-text">
                                    <span class="txt-dec-cust cursor-pointer" @click="setSinglepage(item)">
                                        {{ item.name ? item.name : "" }}
                                    </span>
                                    <p class="mb-0 float-right fs-12 subtext--text font-weight-regular">
                                        3yr:
                                        <span class="font-weight-medium maintext--text">
                                            {{ item["3Year"] ? Number(item["3Year"]).toFixed(2) : "0.00" }}
                                        </span>
                                    </p>
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    <v-chip color="secbg" class="table-hide" size="x-small" variant="flat"
                                        style="border-radius: 4px; padding: 10px 8px !important">
                                        <span class="font-weight-medium fs-9">
                                            {{ item.splito ? item.splito : "" }}
                                        </span>
                                    </v-chip>
                                    <v-chip color="secbg" class="table-hide mx-2" size="x-small" variant="flat"
                                        style="border-radius: 4px; padding: 10px 8px !important">
                                        <span class="font-weight-medium fs-9">
                                            {{ item.splitt ? item.splitt.replace("SCHEME", "") : "" }}
                                        </span>
                                    </v-chip>
                                    <span class="mb-0 fs-10 subtext--text float-right font-weight-regular mt-1">
                                        AUM:
                                        <span class="font-weight-medium maintext--text">
                                            {{ item.AUM ? Number(item.AUM).toFixed(2) : "0.00" }}
                                        </span>
                                    </span>
                                </v-list-item-subtitle>
                            </v-list-item>
                            <v-divider></v-divider>
                        </div>
                        <!-- Phase 2: Add key to force re-render when uid or PreDefinedMW.is changes -->
                        <div @click.stop class="pos-abs table-hov" :key="`hover-mf-${uid}-${PreDefinedMW.is}`"
                            style="bottom: 8px; left: 50%; transform: translate(-50%, 0);">
                            <v-btn @click="putMForder(item, 'buy')" size="x-small"
                                class="elevation-0 text-none maingreen--text font-weight-bold mr-1" color="secgreen">
                                Buy
                            </v-btn>
                            <v-btn @click="putMForder(item, 'sip')" size="x-small"
                                class="elevation-0 text-none primary--text font-weight-bold" color="#F1F3F8">
                                SIP
                            </v-btn>
                            <v-btn v-if="!PreDefinedMW.is" @click="deleteuserMutual(item)"
                                style="border: 1px solid #EBEEF0" min-width="20px" color="secbg"
                                class="px-0 font-weight-bold white--text elevation-0 ml-1" size="x-small">
                                <v-icon size="18" color="maintext">mdi-close</v-icon>
                            </v-btn>
                        </div>
                    </v-card>
                </div>
                <v-card v-else class="text-center py-16 px-8 elevation-0 crd-trn" width="100%">
                    <img class="align-self-stretch mx-auto" width="70px" src="/src/assets/searcha-icon.svg" />
                    <p class="txt-999 fs-14 mb-1">
                        Hmmm, Looks like no symbols in your watchlist
                        <span>{{ !PreDefinedMW.is ? " — why not add some?" : "." }}</span>
                    </p>
                    <v-btn v-if="!PreDefinedMW.is" color="primary" class="text-none" size="small"
                        @click="uid ? ((addscript = true), (watchsecti = false), (mfwatchlistdata = []), (nodata = null), putMWfocus()) : router.push('/login')"
                        variant="text">
                        Add script <v-icon class="ml-1" size="14">mdi-plus-circle</v-icon>
                    </v-btn>
                </v-card>
            </div>

            <!-- Mutual Fund Search Results -->
            <div v-else-if="addscript" style="height: calc(100vh - 188px)"
                class="overflow-y-auto overflow-x-hidden no-scroll">
                <div v-if="mfwatchlistdata && mfwatchlistdata.length > 0">
                    <div v-for="(w, l) in mfwatchlistdata" :key="l" class="table-row pos-rlt">
                        <v-list-item :disabled="w.watchlist"
                            @click="uid ? getusedMutual('add', w) : router.push('/login')" class="px-0 crd-trn">
                            <v-list-item-title class="maintext--text mb-0 table-hov-text fs-14">
                                {{ w.name }}
                            </v-list-item-title>
                            <v-chip-group column class="mb-0">
                                <v-chip color="secbg" size="x-small" variant="flat"
                                    style="border-radius: 4px; padding: 10px 8px !important">
                                    <span class="font-weight-medium">
                                        {{ w.Type ? w.Type : "" }}
                                    </span>
                                </v-chip>
                                <v-chip color="secbg" size="x-small" variant="flat"
                                    style="border-radius: 4px; padding: 10px 8px !important">
                                    <span class="font-weight-medium">
                                        {{ w.SubType ? w.SubType : "" }}
                                    </span>
                                </v-chip>
                            </v-chip-group>
                            <div>
                                <v-icon v-if="uid" class="float-right" :color="w.watchlist ? 'primary' : 'maintext'">
                                    {{ w.watchlist ? "mdi-bookmark" : "mdi-bookmark-plus-outline" }}
                                </v-icon>
                            </div>
                        </v-list-item>
                        <v-divider></v-divider>
                    </div>
                </div>
                <v-card v-else-if="nodata" class="text-center py-16 px-8 elevation-0 crd-trn" width="100%">
                    <img class="align-self-stretch mx-auto" width="70px" src="/src/assets/searcha-icon.svg" />
                    <p class="txt-999 fs-14 mb-1">No results found</p>
                </v-card>
            </div>
        </div>

        <!-- Predefined Watchlist Cards (pdmwdata) -->
        <!-- Show in all tabs when viewing predefined watchlists (like old app) -->
        <div v-if="!panel && !optchainbasket && !addscript && !watchsecti" class="predefined-watchlist-cards mb-3">
            <v-card id="pdcard" color="cardbg" class="elevation-0">
                <v-row no-gutters>
                    <v-col v-for="(s, l) in pdmwdata" :key="l" cols="6" class="pa-1 pdmwlists">
                        <v-card class="elevation-0 crd-trn pos-rlt cursor-p"
                            :color="watchlistis == s.key ? 'primary' : 'secbg'"
                            style="border: 1px solid #EBEEF0;background-color: #EBEEF0 !important;border-radius: 5px !important;"
                            @click="uid ? setSSDtab(l, s.token, s.exch, s.tsym) : null">
                            <div style="display: flex;justify-content: space-between;align-content: center !important;"
                                class="pa-2">
                                <v-list-item-title class="maintext--text font-weight-medium fs-13">
                                    {{ s.tsym ? s.tsym : '' }}
                                </v-list-item-title>

                                <span class="text-right">
                                    <span class="maintext--text font-weight-medium fs-13">
                                        ₹<span :id="`p${s.token}ltp`">{{ s.ltp ? s.ltp : "0.00" }}</span>
                                    </span>
                                </span>
                            </div>
                            <div style="display: flex;justify-content: flex-end;width: 100% !important;color: #676767 !important;"
                                :class="[
                                    'd-inline-flex font-weight-medium fs-12 px-2',
                                    s.ch > 0 ? 'maingreen--text' : s.ch < 0 ? 'mainred--text' : 'subtext--text'
                                ]" :id="`p${s.token}chpclr`">
                                <span :id="`p${s.token}ch`">{{ s.ch ? s.ch : "0.00" }}</span>
                                <span :id="`p${s.token}chp`">({{ s.chp ? s.chp : "0.00" }})</span>
                            </div>
                            <div class="pos-abs pdmwlist z-i1 mt-n6 ml-0">
                                <v-btn @click.stop @click="getAllindicedata(s, l == 0 ? 1 : 0)" class="elevation-1"
                                    variant="flat" size="x-small" color="cardbg"
                                    style="width: 22px; height: 22px; min-width: 22px; padding: 0;">
                                    <v-icon color="maintext" size="14">mdi-pencil</v-icon>
                                </v-btn>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
            </v-card>
        </div>

        <!-- Exchange Filter Chips (when addscript and not panel) -->
        <div v-if="!panel && addscript && !watchsecti" class="exchange-filter-section">
            <v-chip-group mandatory v-model="stocksexch" @update:model-value="searchFilter" class="mb-0 watchlist" row>
                <v-chip v-for="(e, x) in exchfilter" :key="x" :value="x" class="font-weight-medium px-3"
                    :color="stocksexch == x ? 'maintext' : 'secbg'"
                    :text-color="stocksexch == x ? 'mainbg' : 'maintext'" size="medium">
                    {{ e }}
                </v-chip>
            </v-chip-group>
            <v-divider></v-divider>
            <div v-if="items && items.length > 0">
                <p class="subtext--text fs-14 mt-2 mb-1">{{ items.length }} search result by you</p>
                <v-divider></v-divider>
            </div>
        </div>


        <!-- Stock List -->
        <div v-else-if="!panel && !optchainbasket && !addscript && !watchsecti" class="stock-list">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
                <span class="loading-text">Loading watchlist...</span>
            </div>

            <!-- No Data State -->
            <!-- CRITICAL: Don't show "Add Stocks" button for MY:HOLDINGS - it's a predefined watchlist -->
            <div v-else-if="watchlistdata === 'no data' && watchlistis !== 'MY:HOLDINGS'" class="no-data-state">
                <v-icon size="48" color="grey lighten-1">mdi-chart-line-variant</v-icon>
                <p class="no-data-text">No stocks in this watchlist</p>
                <button @click="addscript = true" class="add-stocks-btn">
                    <v-icon left size="16">mdi-plus</v-icon>
                    Add Stocks
                </button>
            </div>

            <!-- Empty Holdings State for MY:HOLDINGS -->
            <div v-else-if="watchlistis === 'MY:HOLDINGS' && (watchlistdata === 'no data' || !watchlistdata || (Array.isArray(watchlistdata) && watchlistdata.length === 0))"
                class="no-data-state">
                <v-icon size="48" color="grey lighten-1">mdi-chart-line-variant</v-icon>
                <p class="no-data-text">No holdings available</p>
                <p class="subtext--text fs-12 mt-2">Your holdings will appear here once you have stocks in your
                    portfolio</p>
            </div>

            <!-- Stock Items (Vue 2 style) -->
            <div v-else-if="watchlistdata && Array.isArray(watchlistdata) && watchlistdata.length > 0"
                style="height: calc(100vh - 218px);" class="overflow-y-auto overflow-x-hidden no-scroll" s>
                <draggable v-model="watchlistdata" @start="onDragStart" @end="onDragEnd"
                    :item-key="(item) => item.id || item.token || Math.random()" :disabled="isPreDefinedWatchlist">
                    <template #item="{ element: item, index }">
                        <div :key="item.id || item.token || index" class="table-row pos-rlt pt-2 cursor-p"
                            style="border-bottom: 1px solid #EBEEF0;"
                            @click="uid ? setSSDtab('detail', item.token, item.exch, item.tsym || item.tsyms) : null">
                            <p class="maintext--text mb-1 fs-13 px-1">
                                <span class="table-hov-text">{{ item.tsyms ? item.tsyms : item.tsym ? item.tsym : ''
                                    }}</span>
                                <span class="subtext--text">{{ item.exp ? item.exp : '' }}</span>
                                <span v-if="item.weekly"
                                    style="border-radius: 4px; padding: 0px 4px; background-color: #F1F3F8 !important"
                                    class="ml-1">
                                    <span class="font-weight-medium fs-10 lh-16">{{ item.weekly ? item.weekly : ''
                                        }}</span>
                                </span>
                                <span class="float-right maintext--text fs-13">
                                    ₹<span :id="`${item.token}ltp`">{{ item.ltp ? item.ltp : '0.00' }}</span>
                                </span>
                            </p>
                            <p class="mb-0 px-1 lh-16">
                                <span style="border-radius: 4px; padding: 0px 6px; background-color: #F1F3F8 !important"
                                    class="mr-1 table-hov-prd">
                                    <span class="font-weight-medium fs-10 lh-16">{{ item.exch ? item.exch : '' }}</span>
                                </span>
                                <span v-html="setHoldbadge(item.token)"></span>
                                <span class="subtext--text fs-10">{{ item.ser ? item.ser : '' }}</span>
                                <span class="float-right fw-6 fs-12" :id="`${item.token}chpclr`"
                                    :class="item.ch > 0 ? 'maingreen--text' : item.ch < 0 ? 'mainred--text' : 'subtext--text'">
                                    <span :id="`${item.token}ch`">{{ item.ch ? item.ch : '0.00' }}</span>
                                    <span :id="`${item.token}chp`"> ({{ item.chp ? item.chp : '0.00' }}%)</span>
                                </span>
                            </p>
                            <!-- Phase 2: Add key to force re-render when uid or PreDefinedMW.is changes -->
                            <div v-if="uid" @click.stop @mouseenter.stop @mouseleave.stop
                                class="pos-abs table-hov watchlist-hover-options"
                                :key="`hover-${uid}-${PreDefinedMW.is}`"
                                style="bottom: 8px; left: 50%; transform: translate(-50%, 0); z-index: 100;">
                                <div v-if="item.instname != 'UNDIND' && item.instname != 'COM'"
                                    @click.stop="handleMenuDialog('order', item.token, item.exch, item.tsym, 'b')"
                                    style="min-width: 24px; background-color: green!important;color: white !important; border-radius: 4px; cursor: pointer;"
                                    class="px-1 pt-1 font-weight-bold white--text elevation-0 fs-10 text-center mr-1">
                                    B
                                </div>
                                <div v-if="item.instname != 'UNDIND' && item.instname != 'COM'"
                                    @click.stop="handleMenuDialog('order', item.token, item.exch, item.tsym, 's')"
                                    style="min-width: 24px; background-color: red!important;color: white !important; border-radius: 4px; cursor: pointer;"
                                    class="px-1 pt-1 font-weight-bold white--text elevation-0 fs-10 text-center mr-1">
                                    S
                                </div>
                                <v-btn @click.stop="setSSDtab('chart', item.token, item.exch, item.tsym)"
                                    style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                    class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                                    <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                                </v-btn>
                                <v-btn v-if="!PreDefinedMW.is" @click.stop="deleteScript(item, index)"
                                    style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                    class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                                    <v-icon size="18" color="maintext">mdi-close</v-icon>
                                </v-btn>

                                <v-menu close-on-click location="bottom" :offset="[0, 8]" class="table-menu">
                                    <template v-slot:activator="{ props }">
                                        <v-btn v-bind="props" @click.stop style="border: 1px solid #EBEEF0"
                                            min-width="20px" color="mainbg"
                                            class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                                            <v-icon size="18" color="maintext">mdi-dots-horizontal</v-icon>
                                        </v-btn>
                                    </template>
                                    <v-card class="table-menu-list">
                                        <v-list density="compact">
                                            <div v-for="(m, k) in menulist" :key="k">
                                                <v-list-item
                                                    v-if="m.type == 'depth' || m.type == 'Funda' ? item.instname != 'UNDIND' && item.instname != 'COM' : m.type == 'delete' ? (!PreDefinedMW.is ? true : false) : true"
                                                    @click="m.type != 'delete' ? setSSDtab(m.type, item.token, item.exch, item.tsym) : deleteScript(item, index)"
                                                    class="pl-3 pr-6">
                                                    <template v-slot:prepend>
                                                        <img v-if="typeof m.icon === 'number' && m.icon > 2"
                                                            width="20px" class="pl-1"
                                                            :src="`/src/assets/orderbook/${m.icon}.svg`" />
                                                        <v-icon v-else-if="typeof m.icon === 'number' && m.icon <= 2"
                                                            color="#506D84">{{ m.icon }}</v-icon>
                                                        <v-icon v-else color="#506D84">{{ m.icon }}</v-icon>
                                                    </template>
                                                    <v-list-item-title class="subline--text font-weight-medium fs-14">
                                                        {{ m.name }}
                                                    </v-list-item-title>
                                                </v-list-item>
                                                <v-divider v-if="m.hr" class="mx-3"></v-divider>
                                            </div>
                                        </v-list>
                                    </v-card>
                                </v-menu>
                            </div>
                            <div v-else @click.stop @mouseenter.stop @mouseleave.stop
                                class="pos-abs table-hov watchlist-hover-options"
                                style="bottom: 8px; left: 50%; transform: translate(-50%, 0); z-index: 100;">
                                <div @click.stop="uid ? (item.instname != 'UNDIND' && item.instname != 'COM' ? handleMenuDialog('order', item.token, item.exch, item.tsym, 'b') : null) : router.push('/login')"
                                    style="min-width: 24px; background-color: #43A833; border-radius: 4px; cursor: pointer;"
                                    class="px-1 pt-1 font-weight-bold white--text elevation-0 mr-1 fs-10 text-center">
                                    B
                                </div>
                                <div @click.stop="uid ? (item.instname != 'UNDIND' && item.instname != 'COM' ? handleMenuDialog('order', item.token, item.exch, item.tsym, 's') : null) : router.push('/login')"
                                    style="min-width: 24px; background-color: #F23645; border-radius: 4px; cursor: pointer;"
                                    class="px-1 pt-1 font-weight-bold white--text elevation-0 fs-10 text-center">
                                    S
                                </div>
                            </div>
                            <v-divider></v-divider>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>

        <!-- Search Results List (inline when addscript is true) -->
        <div v-if="!panel && addscript && !watchsecti" style="height: calc(100vh - 188px)"
            class="overflow-y-auto overflow-x-hidden no-scroll">
            <div v-if="items && items.length > 0">
                <div v-for="(w, l) in items" :key="l" class="search-result-item pos-rlt">
                    <v-row no-gutters class="align-center py-2 px-3 cursor-pointer"
                        @click="optsearch ? setSSDtab(l, w.token, w.exch, w.tsym) : addToWatchlist(w, l)">
                        <v-col cols="10" class="d-flex flex-column">
                            <!-- Primary text: Instrument symbol -->
                            <p class="maintext--text mb-1 table-hov-text fs-13 font-weight-medium">
                                {{ w.tsyms ? w.tsyms : w.tsym }}
                                <span v-if="w.exp" class="subtext--text">{{ w.exp }}</span>
                            </p>
                            <!-- Exchange chip -->
                            <div class="d-flex align-center">
                                <v-chip :color="w.exch === 'NSE' ? '#E6EBFFCC' :
                                    w.exch === 'BSE' ? '#D4F0F0CC' :
                                        w.exch === 'NFO' ? '#EAD6FFCC' :
                                            w.exch === 'BFO' ? '#FFD6D6CC' :
                                                w.exch === 'CDS' ? '#D4FBFFCC' :
                                                    w.exch === 'NCOM' ? '#FFF9C4CC' :
                                                        w.exch === 'BCOM' ? '#FFE6CCCC' :
                                                            w.exch === 'BCD' ? '#F2E1C3CC' :
                                                                w.exch === 'MCX' ? '#FFF0B3CC' :
                                                                    '#EBDDEFCC'" size="x-small" variant="flat"
                                    class="mr-1" style="border-radius: 4px; padding: 2px 6px 0 6px; height: 18px;">
                                    <span class="font-weight-medium fs-10" style="color: black;">
                                        {{ w.exch ? w.exch : "" }}
                                    </span>
                                </v-chip>
                                <span v-if="w.ser" class="subtext--text fs-10 ml-1">{{ w.ser }}</span>
                            </div>
                        </v-col>
                        <!-- Bookmark icon on the right -->
                        <v-col cols="2" class="d-flex justify-end align-center">
                            <v-icon v-if="!optsearch" :color="w.watchlist ? 'primary' : 'maintext'" size="24">
                                {{ w.watchlist ? "mdi-bookmark" : "mdi-bookmark-outline" }}
                            </v-icon>
                        </v-col>
                    </v-row>
                    <!-- Hover actions (hidden by default, shown on hover) -->
                    <div @click.stop class="pos-abs table-hov search-result-hover"
                        style="bottom: 8px; left: 50%; transform: translate(-50%, 0)">
                        <div v-if="w.instname != 'UNDIND' && w.instname != 'COM'"
                            @click="handleMenuDialog('order', w.token, w.exch, w.tsym, 'b')"
                            style="min-width: 24px; background-color: green !important; color: white !important; border-radius: 4px"
                            class="px-1 pt-1 font-weight-bold white--text elevation-0 mr-1 fs-10 text-center">
                            B
                        </div>
                        <div v-if="w.instname != 'UNDIND' && w.instname != 'COM'"
                            @click="handleMenuDialog('order', w.token, w.exch, w.tsym, 's')"
                            style="min-width: 24px; background-color: red !important; color: white !important; border-radius: 4px"
                            class="px-1 pt-1 font-weight-bold white--text elevation-0 mr-1 fs-10 text-center">
                            S
                        </div>
                        <v-btn @click="setSSDtab('chart', w.token, w.exch, w.tsym)" style="border: 1px solid #EBEEF0"
                            min-width="20px" color="mainbg" class="px-0 font-weight-bold white--text elevation-0 mr-1"
                            size="x-small">
                            <v-icon size="18" color="maintext">mdi-chart-line-variant</v-icon>
                        </v-btn>

                        <v-menu close-on-click location="bottom" :offset="[0, 8]" class="table-menu">
                            <template v-slot:activator="{ props }">
                                <v-btn v-bind="props" style="border: 1px solid #EBEEF0" min-width="20px" color="mainbg"
                                    class="px-0 font-weight-bold white--text elevation-0 mr-1" size="x-small">
                                    <v-icon size="18" color="maintext">mdi-dots-horizontal</v-icon>
                                </v-btn>
                            </template>
                            <v-card class="table-menu-list">
                                <div class="py-2">
                                    <div v-for="(m, k) in menulist" :key="k">
                                        <div v-if="m.type == 'depth' || m.type == 'Funda' ? w.instname != 'UNDIND' && w.instname != 'COM' : m.type == 'delete' ? false : true"
                                            @click="setSSDtab(m.type, w.token, w.exch, w.tsym)"
                                            class="d-flex align-center px-3 py-2 cursor-pointer menu-item">
                                            <div class="mr-3 d-flex align-center">
                                                <img v-if="typeof m.icon === 'number' && m.icon > 2" width="20px"
                                                    :src="`/src/assets/orderbook/${m.icon}.svg`" />
                                                <v-icon v-else-if="typeof m.icon === 'number' && m.icon <= 2"
                                                    color="#506D84" size="20">{{ m.icon }}</v-icon>
                                                <v-icon v-else color="#506D84" size="20">{{ m.icon }}</v-icon>
                                            </div>
                                            <p class="subline--text font-weight-medium fs-14 mb-0">
                                                {{ m.name }}
                                            </p>
                                        </div>
                                        <v-divider v-if="m.hr" class="mx-3"></v-divider>
                                    </div>
                                </div>
                            </v-card>
                        </v-menu>
                    </div>
                    <v-divider></v-divider>
                </div>
            </div>
            <v-card v-else class="crd-trn text-center py-16 px-8 elevation-0" width="100%">
                <p class="font-weight-bold mb-2 maintext--text">
                    {{ nodata == null ? "Type more than 2 letter" : "No Contract Found" }}
                </p>
                <span class="body-2 mb-5 grey--text"> {{ nodata == null ? "Eg. for Nifty Type: Nif" :
                    "Search for another name."
                    }}</span>
            </v-card>
        </div>

        <!-- Create Watchlist Dialog -->
        <v-dialog v-model="createMWdialog" max-width="400">
            <v-card>
                <v-card-title>Create New Watchlist</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newWatchlistName" label="Watchlist Name" outlined dense
                        :rules="[v => !!v || 'Name is required']"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="createMWdialog = false" text>Cancel</v-btn>
                    <v-btn @click="createWatchlist" color="primary" :disabled="!newWatchlistName">
                        Create
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Delete Watchlist Dialog -->
        <v-dialog v-model="deleteMWdialog" max-width="400">
            <v-card>
                <v-card-title>Delete Watchlist</v-card-title>
                <v-card-text>
                    Are you sure you want to delete "{{ watchlistToDelete }}" watchlist?
                    This action cannot be undone.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="deleteMWdialog = false" variant="text">Cancel</v-btn>
                    <v-btn @click="deleteWatchlist" color="error">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Index Selection Dialog -->
        <v-dialog v-model="indexdialog" hide-overlay width="420">
            <v-card class="pt-2 overflow-hidden elevation-0 rounded-xl" color="cardbg">
                <v-list-item-title class="font-weight-bold title maintext--text my-2 px-4">
                    Select a Index
                    <v-icon @click="indexdialog = false" class="float-right" color="maintext">mdi-close</v-icon>
                </v-list-item-title>
                <v-divider></v-divider>
                <v-expansion-panels v-model="indexpanel" flat class="expan" multiple>
                    <v-expansion-panel v-for="(q, w, e) in allindex" :key="`index-panel-${w}-${e}`" flat>
                        <v-expansion-panel-title class="fs-14 font-weight-medium secbg primary--text"
                            style="color: #2b38b7 !important;background-color: #F1F3F8 !important;">
                            {{ w }} ({{ q.length }})
                        </v-expansion-panel-title>
                        <v-expansion-panel-text class="fs-13">
                            <v-card class="elevation-0 rounded-0 overflow-y-auto" height="378px" color="transparent">
                                <template v-for="(a, s) in q" :key="`index-item-${w}-${s}`">
                                    <v-list-item v-if="singleindex.n != a.token" class="px-6 cursor-pointer"
                                        @click="singleindex.token != a.token ? setChangeindex(a, w) : null">
                                        <v-list-item-title
                                            :class="singleindex.token == a.token ? 'primary--text' : 'maintext--text'"
                                            class="mb-1 table-hov-text font-weight-medium">
                                            {{ a.idxname ? a.idxname : "" }}
                                        </v-list-item-title>
                                        <template v-slot:append>
                                            <v-icon :color="singleindex.token == a.token ? 'primary' : 'maintext'"
                                                size="20">
                                                {{ singleindex.token == a.token ?
                                                    "mdi-checkbox-marked-circle-outline" :
                                                    "mdi-plus-circle-outline" }}
                                            </v-icon>
                                        </template>
                                    </v-list-item>
                                </template>
                            </v-card>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card>
        </v-dialog>

        <!-- Context Menu -->
        <v-menu v-model="contextMenu.show" :position-x="contextMenu.x" :position-y="contextMenu.y" location="bottom"
            :offset="[0, 8]">
            <v-list dense>
                <v-list-item @click="removeFromWatchlist(contextMenu.item, contextMenu.index)">
                    <v-list-item-icon>
                        <v-icon color="error">mdi-delete</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Remove from Watchlist</v-list-item-title>
                </v-list-item>
                <v-list-item @click="openStockDetails(contextMenu.item)">
                    <v-list-item-icon>
                        <v-icon>mdi-chart-line</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>View Details</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import { useSessionStore } from '../../stores/sessionStore'
import { getMwatchlistset, getGloabSearch, getMHoldingdata, getMHoldings, getPreDefinedMW, getClientDetails, getMFwatchlist, getBSKMargin, getPlaceOrder, getIndexList, getLtpdata, getMPosotion, getMOrderbook, getMLimits, getADindices } from '../../components/mixins/getAPIdata.js'
import { mynturl, myntappurl, params } from '../../apiurl.js'
import draggable from 'vuedraggable'
import { dragscroll } from 'vue-dragscroll'

// Register draggable component
const components = {
    draggable
}

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const sessionStore = useSessionStore()

// Reactive data
const panel = ref(false) // Toggle between stocks (false) and mutual funds (true)
const addscript = ref(false)
const watchsecti = ref(false)
const searchloading = ref(false)
const isLoading = ref(true)
const mfisLoading = ref(true) // Mutual fund loading state
const wsListenerAdded = ref(false)
const stocksContainer = ref(null)
const isHoveringWatchlist = ref(false)
let lastScrollTop = 0
let cachedScrollInfo = null

// Watchlist tabs drag scroll
const watchlistTabsContainer = ref(null)
const isDraggingTabs = ref(false)
let tabsStartX = 0
let tabsScrollLeft = 0

// Watchlist data
const watchlist = ref(['Millionaire'])
const watchlistis = ref(null)
const watchlistdata = ref([])
// Cache last known prices to avoid flashing 0.00 when WS sends sparse/partial ticks
const priceCache = ref({})
// Persist a per-token merged quote so we can update only keys provided in each tick
const lastState = ref({})
// Cache complete watchlist data for fallback when WebSocket doesn't update
const watchlistDataCache = ref({}) // { watchlistName: { data: [], timestamp: number } }

// Search and items
const allitems = ref([]) // All search results
const noitems = ref([])
const nodata = ref(null)

// Filters and sorting
const stocksexch = ref(0) // Exchange filter: 0=All, 1=Equity, 2=F&O, 3=Currency, 4=Commodities, 5=Indices
const exchfilter = ref(["All", "Equity", "F&O", "Currency", "Commodities", "Indices"])
const mwfilter = ref(null)
const mwfilters = ref([
    { key: "a", text: "Script - A to Z" },
    { key: "z", text: "Script - Z to A" },
    { key: "ltp-h", text: "Price - High to Low" },
    { key: "ltp-l", text: "Price - Low to High" },
    { key: "ch-h", text: "Per.chg - High to Low" },
    { key: "ch-l", text: "Per.chg - Low to High" },
])

// Mutual fund data
const mfuseritem = ref([]) // User's mutual fund watchlist
const mfwatchlistdata = ref([]) // Mutual fund search results
const allmutualfunds = ref(null) // All mutual funds data
const mfmodel = ref(null)
const mfsearch = ref('')
const mfexch = ref(0) // Exchange filter: 0=All, 1=Equity, 2=Debt, 3=Hybrid, 4=Other
const mfexchfilter = ref(["All", "Equity", "Debt", "Hybrid", "Other"])
const mutualuseritems = ref([]) // Filtered mutual fund search results
const mffilter = ref(null)
const mffilters = ref([
    { key: "a", text: "Script - A to Z" },
    { key: "z", text: "Script - Z to A" },
    { key: "nav-h", text: "NAV - High to Low" },
    { key: "nav-l", text: "NAV - Low to High" },
    { key: "y-h", text: "3yr rtn - High to Low" },
    { key: "y-l", text: "3yr rtn - Low to High" },
])

// Options chain basket
const optchainbasket = ref(false) // Show/hide options basket
const optchainbasketdata = ref([]) // Basket items
const prdordplace = ref(false) // Product: false=MIS, true=NRML
const totalmargin = ref(0)
const postTrademargin = ref(0)
const orderloader = ref(false)

// Options search
const optsearch = ref(false)
const optsearchdata = ref({})
const stksearch = ref(null)

// Index management
const pdmwdata = ref([
    { key: "NIFTY50:NSE", exch: "NSE", token: "26000", tsym: "Nifty 50" },
    { key: "NIFTYBANK:NSE", exch: "NSE", token: "26009", tsym: "Nifty Bank" },
])
const allindex = ref({ NSE: [], BSE: [], MCX: [] })
const indexdialog = ref(false)
const singleindex = ref({})
const indexpanel = ref([0]) // Array for multiple expansion panels

// Client details
const clientdetails = ref({})

// Menu list for context menu
const menulist = ref([
    { name: "Create GTT / GTC", icon: 4, type: "cGTT" },
    { name: "Create Alert", icon: 5, type: "alert" },
    { name: "Market Depth", icon: 6, type: "depth" },
    { name: "Chart", icon: 7, type: "chart", hr: true },
    { name: "Delete", icon: 13, type: "delete" },
    { name: "Fundamentals", icon: 9, type: "Funda" },
    { name: "Details", icon: 10, type: "detail" },
])

// Additional state
const aaddtoMW = ref([])
const uniqkey = ref([])

const mergeTick = (token, patch) => {
    const prev = lastState.value[token] || {}
    const out = { ...prev }

    // Normalize numbers
    const num = (v) => {
        const n = parseFloat(v)
        return isFinite(n) ? n : undefined
    }

    const ltp = num(patch.ltp ?? patch.lp ?? patch.l)
    const prevClose = num(patch.c ?? patch.prev_close_price ?? patch.close)
    const chIn = num(patch.ch)
    const chpIn = num(patch.chp)

    if (typeof ltp !== 'undefined') out.ltp = ltp
    if (typeof prevClose !== 'undefined') out.prevClose = prevClose
    if (typeof chIn !== 'undefined') out.ch = chIn
    if (typeof chpIn !== 'undefined') out.chp = chpIn

    // Derive missing values
    if (typeof out.ch === 'undefined' && typeof out.ltp !== 'undefined' && typeof out.prevClose !== 'undefined') {
        out.ch = out.ltp - out.prevClose
    }
    if (typeof out.chp === 'undefined' && typeof out.ch !== 'undefined' && typeof out.prevClose !== 'undefined' && out.prevClose > 0) {
        out.chp = (out.ch / out.prevClose) * 100
    }

    lastState.value[token] = out
    return out
}
const PreMWlist = ref([
    { key: "MY:HOLDINGS", text: "My stocks" },
    { key: "NIFTY50:NSE", text: "Nifty50" },
    { key: "NIFTYBANK:NSE", text: "Bank Nifty" },
    { key: "SENSEX:BSE", text: "Sensex" },
])
// Phase 2: Keep ref for storing API response data (used in setPDwatchlist)
const PreDefinedMWRef = ref({})
const watchdraglist = ref('')

// Search data
const search = ref('')
const items = ref([])
const model = ref(null)

// Dialog states
const createMWdialog = ref(false)
const deleteMWdialog = ref(false)
const newWatchlistName = ref('')
const watchlistToDelete = ref('')

// Context menu
const contextMenu = ref({
    show: false,
    x: 0,
    y: 0,
    item: null,
    index: null
})

// Computed
const uid = computed(() => authStore.uid)
const mtoken = computed(() => authStore.mtoken)
const isPreDefinedWatchlist = computed(() => {
    return ['MY:HOLDINGS', 'NIFTY50:NSE', 'NIFTYBANK:NSE', 'SENSEX:BSE'].includes(watchlistis.value)
})

// Phase 2: Ensure PreDefinedMW.is is reactive and computed from watchlistis
// This ensures hover options show/hide correctly based on current watchlist
const PreDefinedMW = computed(() => {
    const isPredefined = isPreDefinedWatchlist.value
    // Return an object with .is property that's reactive
    return {
        is: isPredefined,
        ...PreDefinedMWRef.value // Spread other properties if they exist
    }
})

// Methods
const ensureSessionReady = async () => {
    // First, verify authentication tokens are present
    // If user is not logged in, silently return false (no error logging)
    const suid = uid.value || sessionStorage.getItem('userid')
    const stok = mtoken.value || sessionStorage.getItem('msession')
    const sessionStatus = sessionStorage.getItem('c3RhdHVz')
    const isLoggedIn = sessionStatus === 'dmFsaWR1c2Vy' && suid && stok

    // If user is not logged in, just return false silently
    if (!isLoggedIn) {
        return false
    }

    // Check if mynturl is loaded
    if (!mynturl.myntapi || !mynturl.stat) {
        // Try to load from sessionStorage
        if (uid.value) {
            const loaded = sessionStore.loadMyntUrl(uid.value)
            if (loaded) {
                return true
            }
        }

        // If still not loaded, check if we can use myntappurl as fallback
        if (params && myntappurl.myntapi) {
            // Temporarily populate mynturl with myntappurl data
            mynturl.myntapi = myntappurl.myntapi
            mynturl.wss = myntappurl.wss
            mynturl.source = myntappurl.source
            mynturl.stat = 1
            return true
        }

        // Only show error if user is logged in but session is not ready
        // This is an unexpected scenario - user is logged in but API URL is not available
        if (isLoggedIn) {
            // Use console.warn instead of console.error to reduce noise
            // Only log if this is a real issue (user logged in but session not ready)
            console.warn("⚠️ API URL not available yet, session may still be initializing")
            // Only show snackbar if user is actively trying to use a feature
            // Don't show on initial mount - wait for user action
        }
        return false
    }

    // Session is ready
    return true
}

const getExchangeColor = (exch) => {
    const colors = {
        'NSE': '#E6EBFFCC',
        'BSE': '#D4F0F0CC',
        'NFO': '#EAD6FFCC',
        'BFO': '#FFD6D6CC',
        'CDS': '#D4FBFFCC',
        'NCOM': '#FFF9C4CC',
        'BCOM': '#FFE6CCCC',
        'BCD': '#F2E1C3CC',
        'MCX': '#FFF0B3CC'
    }
    return colors[exch] || '#EBDDEFCC'
}

const getPriceChangeColor = (change) => {
    if (!change) return ''
    const num = parseFloat(change)
    if (num > 0) return 'success--text'
    if (num < 0) return 'error--text'
    return ''
}

const formatPriceChange = (change) => {
    if (!change) return '0.00'
    const num = parseFloat(change)
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2)
}

const formatPercentage = (percentage) => {
    if (!percentage) return '0.00'
    const num = parseFloat(percentage)
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2)
}

const getPriceChangeClass = (value) => {
    if (!value) return 'neutral'
    const numValue = parseFloat(value)
    if (numValue > 0) return 'positive'
    if (numValue < 0) return 'negative'
    return 'neutral'
}

const formatPercentageChange = (value) => {
    if (!value) return '0.00%'
    const numValue = parseFloat(value)
    const formatted = numValue > 0 ? `+${numValue.toFixed(2)}` : numValue.toFixed(2)
    return `${formatted}%`
}

// Search timeout ref for debouncing
let searchTimeout = null

// Handle search input with uppercase conversion and cursor preservation
const onSearchInput = (event) => {
    const input = event.target
    const pos = input.selectionStart ?? search.value.length

    // Convert to uppercase
    search.value = search.value.toUpperCase()

    // Restore cursor position
    nextTick(() => {
        input.setSelectionRange(pos, pos)
    })

    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    // Debounce search by 500ms
    searchTimeout = setTimeout(async () => {
        await performSearch()
    }, 500)
}

const performSearch = async () => {
    if (!search.value || search.value.length < 2) {
        items.value = []
        addscript.value = false
        return
    }

    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        return
    }

    addscript.value = true
    searchloading.value = true
    try {
        // Get client exchange filters if available
        if (!clientdetails.value || Object.keys(clientdetails.value).length === 0) {
            await getClientexch()
        }

        // Build query string in the same format as old code
        const searchText = search.value.replace("&", "%26")
        const fil = clientdetails.value?.exarr || []
        const category = ["", "EQ", "FO", "CUR", "COM", "IDX"][stocksexch.value] || ""
        const opt = optsearch.value ? "1" : "0"

        const query = `jData={"uid":"${uid.value}","stext":"${searchText}","fil":${JSON.stringify(fil)},"cat":"${category}","opt":"${opt}"}&jKey=${mtoken.value}`

        const res = await getGloabSearch(query)

        if (res && res.stat === "Ok" && res.values && res.values.length > 0) {
            // Process items similar to old code
            allitems.value = res.values

            // Mark items already in watchlist
            if (Array.isArray(watchlistdata.value)) {
                allitems.value.forEach((so) => {
                    if (watchlistdata.value.some(o => o.token === so.token)) {
                        so["watchlist"] = true
                    }

                    // Process NFO/BFO options similar to old code
                    if (["NFO", "BFO"].includes(so.exch)) {
                        const ser = so.tsym.includes("SENSEX") ? so.dname.split(" ") : so.tsym.split(/(\d+)/)
                        so["tsyms"] = ser[0]
                        so["exp"] = so.instname.includes("FUT")
                            ? "FUT"
                            : so.instname.includes("OPT")
                                ? `${ser[5] || ser[3] || ""} ${ser[4]}${so.tsym.includes("SENSEX") || ser[4]?.includes("E") ? "" : "E"}` : ""
                        so["ser"] = so.instname.includes("OPT")
                            ? `${ser[1]} ${ser[2]} ${ser[5] ? ser[3] : ""}`
                            : `${ser[1]} ${ser[2].slice(0, 3)} ${ser[3] && ser[3] !== "FUT" ? ser[3] : ""}`
                    }
                })
            }

            // Apply exchange filter
            searchFilter()
            nodata.value = null
        } else {
            items.value = []
            allitems.value = []
            nodata.value = "noooo"
        }
    } catch (error) {
        console.error('Search error:', error)
        appStore.showSnackbar(0, 'Search failed')
        items.value = []
    } finally {
        searchloading.value = false
    }
}

const addToWatchlist = async (item, index) => {
    // Handle option search differently
    if (optsearch.value) {
        setSSDtab(index, item.token, item.exch, item.tsym)
        return
    }

    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        return
    }

    // Check if watchlist is full (max 50 items)
    if (Array.isArray(watchlistdata.value) && watchlistdata.value.length >= 50) {
        appStore.showSnackbar(0, 'Maximum 50 symbols you can add in single watchlists.')
        return
    }

    // Check if item already exists in watchlist
    if (Array.isArray(watchlistdata.value)) {
        const exists = watchlistdata.value.findIndex(o => o.token === item.token)
        if (exists >= 0) {
            appStore.showSnackbar(0, `${item.tsym || item.tsyms}, script is already exists.`)
            return
        }
    }

    if (item.watchlist) {
        // Remove from watchlist
        await removeFromWatchlist(item, -1)
        item.watchlist = false
    } else {
        // Add to watchlist
        try {
            const res = await getMwatchlistset(
                `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${item.exch}|${item.token}"}&jKey=${mtoken.value}`,
                "AddMultiScripsToMW"
            )

            if (res.stat === "Ok") {
                appStore.showSnackbar(1, `${item.tsym || item.tsyms} added to watchlist`)
                item.watchlist = true
                model.value = item
                await getMWlistdata() // Refresh watchlist data
            } else {
                appStore.showSnackbar(0, res.emsg || 'Failed to add to watchlist')
            }
        } catch (error) {
            console.error('Add to watchlist error:', error)
            appStore.showSnackbar(0, 'Failed to add to watchlist')
        }
    }
}

const selectWatchlist = async (wl) => {
    watchlistis.value = wl

    // Check if it's a predefined watchlist
    if (PreMWlist.value.find(p => p.key === wl)) {
        await setPDwatchlist()
    } else {
        await getMWlistdata()
    }
}

// Handle predefined watchlists
const setPDwatchlist = async () => {
    try {
        isLoading.value = true

        // Phase 2: Ensure PreDefinedMWRef is loaded before using it (critical for tabs to work)
        if (!PreDefinedMWRef.value || PreDefinedMWRef.value.stat !== "Ok") {
            try {
                PreDefinedMWRef.value = await getPreDefinedMW()
            } catch (err) {
                console.log('PreDefinedMW load error in setPDwatchlist:', err)
                isLoading.value = false
                return
            }
        }

        // First try to load from cache for immediate display
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (cached && Array.isArray(cached) && cached.length > 0) {
            watchlistdata.value = cached
            // Restore price states from lastState cache
            cached.forEach(item => {
                if (item.token && lastState.value[item.token]) {
                    const state = lastState.value[item.token]
                    item.ltp = state.ltp !== undefined ? state.ltp.toFixed(2) : (item.ltp || null)
                    item.ch = state.ch !== undefined ? state.ch.toFixed(2) : (item.ch || null)
                    item.chp = state.chp !== undefined ? state.chp.toFixed(2) : (item.chp || null)
                }
            })
            ensureUniqueIds()
        }

        // Unsubscribe from previous WebSocket data
        if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
            const event = new CustomEvent('web-scoketOn', {
                detail: { flow: 'unsub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(event)
        }

        if (watchlistis.value === "MY:HOLDINGS") {
            // CRITICAL: Match Vue 2 logic exactly (line 1637-1643)
            // Vue 2: let data = getMHoldingdata(); if (data && data.length > 0) { data.map((o) => this.watchlistdata.push(o.exch_tsym[0])); } else { this.watchlistdata = "no data"; }
            let data = getMHoldingdata()

            // If no data in memory, try to load via API
            if (!data || !Array.isArray(data) || data.length === 0) {
                try {
                    if (await ensureSessionReady()) {
                        const holdingsResponse = await getMHoldings(true)
                        if (holdingsResponse && holdingsResponse.response && Array.isArray(holdingsResponse.response) && holdingsResponse.response.length > 0) {
                            data = holdingsResponse.response
                        }
                    }
                } catch (error) {
                    console.error('Error loading holdings data:', error)
                }
            }

            if (data && data.length > 0) {
                // Match Vue 2: data.map((o) => this.watchlistdata.push(o.exch_tsym[0]))
                watchlistdata.value = []
                data.forEach(holding => {
                    if (holding.exch_tsym && holding.exch_tsym[0]) {
                        const item = holding.exch_tsym[0]

                        // Ensure required fields for display
                        if (!item.tsyms && !item.tsym && item.token) {
                            item.tsym = item.token
                        }

                        // Initialize price fields
                        if (!item.ltp && item.ltp !== 0) item.ltp = null
                        if (!item.ch && item.ch !== 0) item.ch = null
                        if (!item.chp && item.chp !== 0) item.chp = null

                        // Restore cached prices if available
                        if (item.token && lastState.value[item.token]) {
                            const state = lastState.value[item.token]
                            if (state.ltp !== undefined) item.ltp = state.ltp.toFixed(2)
                            if (state.ch !== undefined) item.ch = state.ch.toFixed(2)
                            if (state.chp !== undefined) item.chp = state.chp.toFixed(2)
                        }

                        // Ensure unique ID for draggable
                        if (!item.id && item.token) {
                            item.id = `holding_${item.token}_${Date.now()}`
                        }

                        watchlistdata.value.push(item)
                    }
                })

                ensureUniqueIds()

                // Save to cache
                if (watchlistdata.value.length > 0) {
                    saveWatchlistToCache("MY:HOLDINGS", watchlistdata.value)
                }
            } else {
                // Match Vue 2: this.watchlistdata = "no data"
                watchlistdata.value = "no data"
            }
        } else if (["NIFTY50:NSE", "NIFTYBANK:NSE", "SENSEX:BSE"].includes(watchlistis.value)) {
            // Phase 2: PreDefinedMWRef should be loaded now (checked above)
            if (PreDefinedMWRef.value && PreDefinedMWRef.value[watchlistis.value]) {
                const items = PreDefinedMWRef.value[watchlistis.value]
                // Initialize price fields for all items
                if (Array.isArray(items)) {
                    watchlistdata.value = []
                    items.forEach(item => {
                        // Ensure required fields exist
                        if (!item.token) return // Skip items without token

                        // Ensure tsym or tsyms exists for display
                        if (!item.tsyms && !item.tsym) {
                            item.tsym = item.token || 'Unknown'
                        }

                        // Initialize price fields properly
                        if (item.ltp === undefined || item.ltp === null) item.ltp = null
                        else if (item.ltp === 0) item.ltp = 0

                        if (item.ch === undefined || item.ch === null) item.ch = null
                        else if (item.ch === 0) item.ch = 0

                        if (item.chp === undefined || item.chp === null) item.chp = null
                        else if (item.chp === 0) item.chp = 0

                        // Restore cached prices if available
                        if (item.token && lastState.value[item.token]) {
                            const state = lastState.value[item.token]
                            if (state.ltp !== undefined) item.ltp = state.ltp.toFixed(2)
                            if (state.ch !== undefined) item.ch = state.ch.toFixed(2)
                            if (state.chp !== undefined) item.chp = state.chp.toFixed(2)
                        }

                        watchlistdata.value.push(item)
                    })

                    // Ensure unique IDs for draggable
                    ensureUniqueIds()
                }
            } else {
                // Keep cached if available, otherwise show no data
                if (!cached || !Array.isArray(cached) || cached.length === 0) {
                    watchlistdata.value = "no data"
                }
            }
        }

        // Ensure unique IDs for draggable
        ensureUniqueIds()

        // Save to cache after loading
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            saveWatchlistToCache(watchlistis.value, watchlistdata.value)
        }

        // Subscribe to WebSocket updates
        if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
            const event = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(event)
            // Delayed re-subscribe after refresh/socket warm-up
            setTimeout(() => {
                const ev = new CustomEvent('web-scoketOn', {
                    detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
                })
                window.dispatchEvent(ev)
            }, 1200)
        } else {
        }

        // Phase 2: PreDefinedMW.is is now computed from isPreDefinedWatchlist
        // No need to set it manually - it's reactive based on watchlistis.value
    } catch (error) {
        console.error('Set predefined watchlist error:', error)
        // Try to keep cached data on error
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (!cached || !Array.isArray(cached) || cached.length === 0) {
            watchlistdata.value = 'no data'
        }
    } finally {
        isLoading.value = false
    }
}

const createWatchlist = async () => {
    if (!newWatchlistName.value) return

    if (watchlist.value.includes(newWatchlistName.value)) {
        appStore.showSnackbar(0, 'Watchlist name already exists')
        return
    }

    try {
        // For now, just add to local array - can be enhanced with API call later
        watchlist.value.unshift(newWatchlistName.value)
        watchlistis.value = newWatchlistName.value
        saveWatchlistsToLocalStorage()

        appStore.showSnackbar(1, `${newWatchlistName.value} watchlist created`)

        createMWdialog.value = false
        newWatchlistName.value = ''

        // Load data for new watchlist
        await getMWlistdata()
    } catch (error) {
        console.error('Create watchlist error:', error)
        appStore.showSnackbar(0, 'Failed to create watchlist')
    }
}

const confirmDeleteWatchlist = (wl) => {
    watchlistToDelete.value = wl
    deleteMWdialog.value = true
}

const deleteWatchlist = async () => {
    try {
        const index = watchlist.value.indexOf(watchlistToDelete.value)
        if (index > -1) {
            watchlist.value.splice(index, 1)
            saveWatchlistsToLocalStorage()

            // Switch to first available watchlist
            if (watchlistis.value === watchlistToDelete.value) {
                watchlistis.value = watchlist.value[0] || 'Millionaire'
                if (watchlist.value.length === 0) {
                    watchlist.value = ['Millionaire']
                    watchlistis.value = 'Millionaire'
                }
                await getMWlistdata()
            }

            appStore.showSnackbar(1, `${watchlistToDelete.value} watchlist deleted`)
        }
    } catch (error) {
        console.error('Delete watchlist error:', error)
        appStore.showSnackbar(0, 'Failed to delete watchlist')
    } finally {
        deleteMWdialog.value = false
        watchlistToDelete.value = ''
    }
}

const showContextMenu = (event, item, index) => {
    event.preventDefault()
    contextMenu.value = {
        show: true,
        x: event.clientX,
        y: event.clientY,
        item,
        index
    }
}

const removeFromWatchlist = async (item, index) => {
    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        return
    }

    try {
        const res = await getMwatchlistset(
            `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${item.exch}|${item.token}"}&jKey=${mtoken.value}`,
            "DeleteMultiMWScrips"
        )

        if (res.stat === "Ok") {
            if (index >= 0) {
                watchlistdata.value.splice(index, 1)
            } else {
                // Find and remove by token
                const idx = watchlistdata.value.findIndex(w => w.token === item.token)
                if (idx >= 0) {
                    watchlistdata.value.splice(idx, 1)
                }
            }

            appStore.showSnackbar(1, `${item.tsym || item.tsyms} removed from watchlist`)
        } else {
            appStore.showSnackbar(0, res.emsg || 'Failed to remove from watchlist')
        }
    } catch (error) {
        console.error('Remove from watchlist error:', error)
        appStore.showSnackbar(0, 'Failed to remove from watchlist')
    } finally {
        contextMenu.value.show = false
    }
}

const deleteScript = async (model, del) => {
    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        return
    }

    try {
        let data
        let item = ""

        // Check if deleting entire watchlist (when aaddtoMW.delete is true)
        if (aaddtoMW.value && aaddtoMW.value.delete && watchlistdata.value && typeof watchlistdata.value === "object" && Array.isArray(watchlistdata.value)) {
            // Build scrips string for API call - delete all items in watchlist
            for (let s = 0; s < watchlistdata.value.length; s++) {
                item += `${s > 0 ? "#" : ""}${watchlistdata.value[s].exch}|${watchlistdata.value[s].token}`
            }
            data = `jData={"uid":"${uid.value}","wlname":"${aaddtoMW.value.wl}","scrips":"${item}"}&jKey=${mtoken.value}`
        } else {
            // Delete single item from watchlist
            data = `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${model && model.exch ? model.exch + "|" + model.token : ""}"}&jKey=${mtoken.value}`
        }

        const res = await getMwatchlistset(data, "DeleteMultiMWScrips")

        if (res.stat === "Ok") {
            if (aaddtoMW.value && aaddtoMW.value.delete) {
                // Delete watchlist from both API and localStorage
                const watchlistIndex = watchlist.value.indexOf(aaddtoMW.value.wl)
                if (watchlistIndex > -1) {
                    watchlist.value.splice(watchlistIndex, 1)
                    saveWatchlistsToLocalStorage()

                    // Switch to first available watchlist if current watchlist was deleted
                    if (watchlistis.value === aaddtoMW.value.wl) {
                        watchlistis.value = watchlist.value[0] || 'Millionaire'
                        if (watchlist.value.length === 0) {
                            watchlist.value = ['Millionaire']
                            watchlistis.value = 'Millionaire'
                        }
                        await getMWlistdata()
                    }
                }

                appStore.showSnackbar(1, `${aaddtoMW.value.wl}, Watchlist deleted.`)
                aaddtoMW.value = {}
            } else {
                // Delete symbol from watchlist
                if (Array.isArray(watchlistdata.value)) {
                    if (del === -1) {
                        // Find and remove by token
                        const d = watchlistdata.value.findIndex((o) => o.token == model.token)
                        if (d >= 0) {
                            watchlistdata.value.splice(d, 1)
                        }
                    } else if (del >= 0) {
                        // Remove by index
                        watchlistdata.value.splice(del, 1)
                    }
                }
                appStore.showSnackbar(1, `${model.tsym || model.tsyms || 'Script'}, script removed`)
            }
            aaddtoMW.value = {}
        } else {
            appStore.showSnackbar(0, res.emsg || "Delete failed")
        }
    } catch (error) {
        console.error('Delete script error:', error)
        appStore.showSnackbar(0, 'Failed to delete script')
    }
}

const openStockDetails = (item) => {
    if (uid.value && item) {

        // Store the stock data for the details page
        localStorage.setItem('ssdtsym', `${item.exch}:${item.token}`)
        localStorage.setItem('ssdtoken', item.token)
        localStorage.setItem('stockDetailsData', JSON.stringify({
            token: item.token,
            exch: item.exch,
            tsym: item.tsym || item.tsyms,
            ltp: item.ltp
        }))

        // Check if we're already on the stock details page
        const currentPath = window.location.pathname
        if (currentPath === '/stocks/details') {
            // If already on stock details page, emit ssd-event to update chart
            const event = new CustomEvent('ssd-event', {
                detail: {
                    type: 'chart',
                    token: item.token,
                    exch: item.exch,
                    tsym: item.tsym || item.tsyms
                }
            })
            window.dispatchEvent(event)
        } else {
            // Navigate to stock details page
            router.push({
                name: 'stocks details',
                query: {
                    token: item.token,
                    exch: item.exch,
                    tsym: item.tsym || item.tsyms
                }
            })
        }
    } else {
    }
}

const saveWatchlistsToLocalStorage = () => {
    if (uid.value) {
        localStorage.setItem(`${uid.value}_watchlists`, JSON.stringify(watchlist.value))
    }
}

// Drag and Drop Methods
const onDragStart = () => {
    if (!isPreDefinedWatchlist.value) {
        watchdraglist.value = watchlistdata.value.map(s => `${s.exch}|${s.token}#`).join("")
    }
}

const onDragEnd = async () => {
    if (!isPreDefinedWatchlist.value) {
        try {
            const currentOrder = watchlistdata.value.map(s => `${s.exch}|${s.token}#`).join("")

            // Delete current order
            const deleteRes = await getMwatchlistset(
                `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${watchdraglist.value}"}&jKey=${mtoken.value}`,
                "DeleteMultiMWScrips"
            )

            if (deleteRes && deleteRes.stat === "Ok") {
                // Add in new order
                const addRes = await getMwatchlistset(
                    `jData={"uid":"${uid.value}","wlname":"${watchlistis.value}","scrips":"${currentOrder}"}&jKey=${mtoken.value}`,
                    "AddMultiScripsToMW"
                )

                if (!(addRes && addRes.stat === "Ok")) {
                    appStore.showSnackbar(0, 'Reorder failed. Please try again.')
                    await getMWlistdata() // Refresh to original order
                }
            } else {
                appStore.showSnackbar(0, 'Reorder failed. Please try again.')
                await getMWlistdata() // Refresh to original order
            }
        } catch (error) {
            console.error('Drag end error:', error)
            appStore.showSnackbar(0, 'Reorder failed. Please try again.')
            await getMWlistdata() // Refresh to original order
        }
    }
}

// Holdings Badge Method
const getHoldingsBadge = (token) => {
    try {
        const holdingsData = getMHoldingdata()
        if (!holdingsData?.length) return null

        const holding = holdingsData.find(x => x.token == token)
        const netqty = holding?.netqty || null

        if (netqty > 0) {
            return `<span style="border-radius: 4px; padding: 0px 6px; background-color: #F1F3F8 !important"
                        class="mr-1 table-hov-prd d-inline-flex align-center">
                        <img width="13px" src="/src/assets/suitcase.svg" />
                        <span class="font-weight-medium fs-12 pl-1 pt-1 primary--text">${netqty}</span>
                    </span>`
        }
        return null
    } catch (error) {
        console.error('Holdings badge error:', error)
        return null
    }
}

// Cache management functions
const saveWatchlistToCache = (watchlistName, data) => {
    if (!watchlistName || !data) return

    try {
        // Save to memory cache
        watchlistDataCache.value[watchlistName] = {
            data: JSON.parse(JSON.stringify(data)), // Deep copy
            timestamp: Date.now()
        }

        // Also save to localStorage for persistence across sessions
        if (uid.value) {
            const cacheKey = `${uid.value}_watchlist_cache_${watchlistName}`
            localStorage.setItem(cacheKey, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }))
        }
    } catch (error) {
        console.error('Error saving watchlist to cache:', error)
    }
}

const loadWatchlistFromCache = (watchlistName) => {
    if (!watchlistName) return null

    try {
        // First check memory cache
        if (watchlistDataCache.value[watchlistName] && watchlistDataCache.value[watchlistName].data) {
            return JSON.parse(JSON.stringify(watchlistDataCache.value[watchlistName].data)) // Deep copy
        }

        // Then check localStorage
        if (uid.value) {
            const cacheKey = `${uid.value}_watchlist_cache_${watchlistName}`
            const cached = localStorage.getItem(cacheKey)
            if (cached) {
                const parsed = JSON.parse(cached)
                // Cache is valid if less than 24 hours old
                if (parsed && parsed.data && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
                    // Restore to memory cache
                    watchlistDataCache.value[watchlistName] = parsed
                    return JSON.parse(JSON.stringify(parsed.data)) // Deep copy
                }
            }
        }
    } catch (error) {
        console.error('Error loading watchlist from cache:', error)
    }

    return null
}

// Ensure each watchlist item has a unique identifier
const ensureUniqueIds = () => {
    if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
        watchlistdata.value.forEach((item, index) => {
            if (!item.id && !item.token) {
                item.id = `item_${index}_${Date.now()}`
            }
        })
    }
}

const loadWatchlistsFromLocalStorage = () => {
    if (uid.value) {
        const stored = localStorage.getItem(`${uid.value}_watchlists`)
        if (stored) {
            try {
                const data = JSON.parse(stored)
                if (Array.isArray(data) && data.length > 0) {
                    watchlist.value = data
                    watchlistis.value = data[0]
                    return true
                }
            } catch (error) {
                console.error('Error loading watchlists from localStorage:', error)
            }
        }
    }
    return false
}

const getWatchlist = async () => {
    try {
        // Check if user is logged in
        const sessionStatus = sessionStorage.getItem("c3RhdHVz")
        const isLoggedIn = sessionStatus === "dmFsaWR1c2Vy" && uid.value && mtoken.value

        // If user not logged in, try localStorage fallback or skip
        if (!isLoggedIn) {
            // Try localStorage as fallback
            if (loadWatchlistsFromLocalStorage()) {
                const cached = loadWatchlistFromCache(watchlistis.value)
                if (cached && Array.isArray(cached) && cached.length > 0) {
                    watchlistdata.value = cached
                } else {
                    watchlistdata.value = 'no data'
                }
                isLoading.value = false
            } else {
                watchlist.value = []
                watchlistdata.value = 'no data'
                isLoading.value = false
            }
            return
        }

        // CRITICAL: Call MWList API first (like old app line 1579)
        // This ensures fresh data is fetched on initial load
        console.log('[MWList] Calling MWList API...', { uid: uid.value, mtoken: mtoken.value ? 'present' : 'missing' })

        const res = await getMwatchlistset(
            `jData={"uid":"${uid.value}","actid":"${uid.value}"}&jKey=${mtoken.value}`,
            "MWList"
        )

        console.log('[MWList] API Response:', res)

        if (res && ((res.values && res.values.length > 0) || res.stat === "Ok")) {
            // Process MWList response (like old app line 1580-1583)
            const data = res.values ? res.values.sort((a, b) => a.localeCompare(b)) : []

            if (data.length > 0) {
                watchlist.value = data
                // CRITICAL: Set first watchlist as default (like old app line 1588)
                watchlistis.value = data[0]
                saveWatchlistsToLocalStorage()
                console.log('[MWList] Watchlist loaded:', { watchlist: data, selected: watchlistis.value })
            } else {
                // No values in response, try localStorage fallback
                console.log('[MWList] No values in response, trying localStorage fallback...')
                if (loadWatchlistsFromLocalStorage()) {
                    // Use localStorage data
                    const cached = loadWatchlistFromCache(watchlistis.value)
                    if (cached && Array.isArray(cached) && cached.length > 0) {
                        watchlistdata.value = cached
                    } else {
                        watchlistdata.value = 'no data'
                    }
                } else {
                    // Initialize with default (like old app line 1592-1593)
                    watchlist.value = ['Millionaire']
                    watchlistis.value = 'Millionaire'
                    saveWatchlistsToLocalStorage()
                }
            }
        } else {
            // API failed or empty response, try localStorage fallback
            console.log('[MWList] API failed or empty, trying localStorage fallback...')
            if (loadWatchlistsFromLocalStorage()) {
                // Use localStorage data
                const cached = loadWatchlistFromCache(watchlistis.value)
                if (cached && Array.isArray(cached) && cached.length > 0) {
                    watchlistdata.value = cached
                } else {
                    watchlistdata.value = 'no data'
                }
            } else {
                // Initialize with default (like old app line 1592-1593)
                watchlist.value = ['Millionaire']
                watchlistis.value = 'Millionaire'
                saveWatchlistsToLocalStorage()
            }
        }

        // Load data for selected watchlist (like old app line 1589)
        await getMWlistdata()
    } catch (error) {
        console.error('[MWList] Get watchlist error:', error)
        // Try localStorage fallback on error
        if (loadWatchlistsFromLocalStorage()) {
            const cached = loadWatchlistFromCache(watchlistis.value)
            if (cached && Array.isArray(cached) && cached.length > 0) {
                watchlistdata.value = cached
            } else {
                watchlistdata.value = 'no data'
            }
        } else {
            // Fallback to default (like old app line 1592-1593)
            watchlist.value = ['Millionaire']
            watchlistis.value = 'Millionaire'
            saveWatchlistsToLocalStorage()
            await getMWlistdata()
        }
    } finally {
        isLoading.value = false
    }
}

const getMWlistdata = async () => {
    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        // Try to load from cache if session not ready
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (cached && Array.isArray(cached) && cached.length > 0) {
            watchlistdata.value = cached
            isLoading.value = false
            return
        }
        watchlistdata.value = 'no data'
        isLoading.value = false
        return
    }

    isLoading.value = true

    try {
        // First, try to load from cache for immediate display
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (cached && Array.isArray(cached) && cached.length > 0) {
            watchlistdata.value = cached
            // Restore price states from lastState cache
            cached.forEach(item => {
                if (item.token && lastState.value[item.token]) {
                    const state = lastState.value[item.token]
                    item.ltp = state.ltp !== undefined ? state.ltp.toFixed(2) : (item.ltp || null)
                    item.ch = state.ch !== undefined ? state.ch.toFixed(2) : (item.ch || null)
                    item.chp = state.chp !== undefined ? state.chp.toFixed(2) : (item.chp || null)
                }
            })
            ensureUniqueIds()
        }

        // Unsubscribe from previous WebSocket data
        // CRITICAL: Only unsubscribe if watchlistdata is an array (not "no data" string)
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            const event = new CustomEvent('web-scoketOn', {
                detail: { flow: 'unsub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(event)
        }

        console.log('[API] Calling MarketWatch...', { wlname: watchlistis.value })
        let res = await getMwatchlistset(`jData={"uid":"${uid.value}","wlname":"${watchlistis.value}"}&jKey=${mtoken.value}`, "MarketWatch");
        console.log('[API] MarketWatch Response:', res)

        if (res && res.values && res.values.length > 0 && res.stat == "Ok") {
            let wl = res.values;
            // Clear current data and rebuild
            watchlistdata.value = []

            for (let l = 0; l < wl.length; l++) {
                // Ensure token exists
                if (!wl[l].token) continue; // Skip items without token

                wl[l]["id"] = l + 1;
                if (wl[l].exch == "NFO" || wl[l].exch == "BFO") {
                    wl[l]["ser"] = wl[l].tsym && wl[l].tsym.includes("SENSEX") ? (wl[l].dname ? wl[l].dname.split(" ") : []) : (wl[l].tsym ? wl[l].tsym.split(/(\d+)/) : []);
                    wl[l]["tsyms"] = wl[l].ser && wl[l].ser[0] ? wl[l].ser[0] : (wl[l].tsym || wl[l].token);
                    wl[l]["exp"] = wl[l].instname && wl[l].instname.includes("FUT") ? "FUT" : wl[l].instname && wl[l].instname.includes("OPT") ? `${wl[l].ser[5] ? wl[l].ser[5] : wl[l].ser[3] ? wl[l].ser[3] : ""} ${wl[l].ser[4] ? wl[l].ser[4] : ""}${wl[l].ser[4] && wl[l].ser[4].includes("E") ? "" : "E"}` : "";
                    wl[l].ser = wl[l].instname && wl[l].instname.includes("OPT") ? `${wl[l].ser[1]} ${wl[l].ser[2]} ${wl[l].ser[5] ? wl[l].ser[3] : ""}` : `${wl[l].ser[1]} ${wl[l].ser[2] ? wl[l].ser[2].slice(0, 3) : ""} ${wl[l].ser[3] && wl[l].ser[3] != "FUT" ? wl[l].ser[3] : ""}`;
                }

                // Ensure tsym or tsyms exists for display
                if (!wl[l].tsyms && !wl[l].tsym) {
                    wl[l].tsym = wl[l].token || `Item ${l + 1}`
                }

                // Initialize price fields properly
                if (wl[l].ltp === undefined || wl[l].ltp === null) wl[l].ltp = null;
                else if (wl[l].ltp === 0) wl[l].ltp = 0;

                if (wl[l].ch === undefined || wl[l].ch === null) wl[l].ch = null;
                else if (wl[l].ch === 0) wl[l].ch = 0;

                if (wl[l].chp === undefined || wl[l].chp === null) wl[l].chp = null;
                else if (wl[l].chp === 0) wl[l].chp = 0;

                // Restore cached prices if available
                if (wl[l].token && lastState.value[wl[l].token]) {
                    const state = lastState.value[wl[l].token]
                    if (state.ltp !== undefined) wl[l].ltp = state.ltp.toFixed(2)
                    if (state.ch !== undefined) wl[l].ch = state.ch.toFixed(2)
                    if (state.chp !== undefined) wl[l].chp = state.chp.toFixed(2)
                }

                watchlistdata.value.push(wl[l]);
            }

            // Ensure we have data before continuing
            if (watchlistdata.value.length === 0) {
                watchlistdata.value = "no data"
                isLoading.value = false
                return
            }

            // Ensure unique IDs for draggable
            ensureUniqueIds()

            // Save to cache after successful load
            saveWatchlistToCache(watchlistis.value, watchlistdata.value)

            // CRITICAL: Only subscribe if watchlistdata is an array (not "no data" string)
            if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
                const event = new CustomEvent('web-scoketOn', {
                    detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
                })
                window.dispatchEvent(event)
            }
            // this.setMWfilter();
            // Also re-subscribe after a short delay to handle page refreshes
            setTimeout(() => {
                // CRITICAL: Only subscribe if watchlistdata is an array (not "no data" string)
                if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
                    const ev = new CustomEvent('web-scoketOn', {
                        detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
                    })
                    window.dispatchEvent(ev)
                }
            }, 1200)
        } else {
            isLoading.value = false;
            // If API fails, keep cached data if available
            if (!cached || !Array.isArray(cached) || cached.length === 0) {
                watchlistdata.value = "no data";
            }
            // eventBus.$emit('snack-event', 2, res.emsg ? res.emsg : 'no data');
        }
    } catch (error) {
        console.error('Get watchlist data error:', error)
        // On error, try to keep cached data
        const cached = loadWatchlistFromCache(watchlistis.value)
        if (!cached || !Array.isArray(cached) || cached.length === 0) {
            watchlistdata.value = 'no data'
        }
    } finally {
        isLoading.value = false
    }
}

// WebSocket data update handler (like Vue 2 optionChainDataParse)
const handleWebSocketUpdate = (event) => {
    const detail = event.detail

    // Handle pdmwdata updates (top indices like NIFTY50, NIFTYBANK)
    // Like Vue 2 line 1719-1734 (optionChainDataParse)
    if (detail && (detail.token || detail.tk)) {
        const data = detail
        const token = data.token || data.tk

        // Update pdmwdata if token matches (like Vue 2 line 1720-1734)
        if (pdmwdata.value && Array.isArray(pdmwdata.value)) {
            const pIndex = pdmwdata.value.findIndex((o) => o.token == token)
            if (pIndex >= 0 && pdmwdata.value[pIndex].token == token) {
                // Update pdmwdata prices (like Vue 2 line 1722-1724)
                if (data.lp !== undefined) pdmwdata.value[pIndex].ltp = Number(data.lp).toFixed(2)
                if (data.ch !== undefined) {
                    pdmwdata.value[pIndex].ch = Number(data.ch) > 0 || Number(data.ch) < 0
                        ? Number(data.ch).toFixed(2)
                        : (0).toFixed(2)
                }
                if (data.chp !== undefined) pdmwdata.value[pIndex].chp = Number(data.chp).toFixed(2)

                // Update DOM elements (like Vue 2 line 1726-1731)
                const ltpTag = document.getElementById(`p${token}ltp`)
                if (ltpTag) {
                    // CRITICAL: Update LTP innerHTML (was missing!)
                    ltpTag.innerHTML = pdmwdata.value[pIndex].ltp || "0.00"

                    const chTag = document.getElementById(`p${token}ch`)
                    const chpTag = document.getElementById(`p${token}chp`)
                    const chpclrTag = document.getElementById(`p${token}chpclr`)

                    if (chTag) chTag.innerHTML = pdmwdata.value[pIndex].ch || "0.00"
                    if (chpTag) chpTag.innerHTML = ` (${pdmwdata.value[pIndex].chp || "0.00"}%)`

                    // Update color class (like Vue 2 line 1731)
                    if (chpclrTag) {
                        const ch = pdmwdata.value[pIndex].ch
                        chpclrTag.className = ch > 0
                            ? 'd-inline-flex font-weight-medium fs-12 px-2 maingreen--text'
                            : ch < 0
                                ? 'd-inline-flex font-weight-medium fs-12 px-2 mainred--text'
                                : 'd-inline-flex font-weight-medium fs-12 px-2 subtext--text'
                    }
                }
            }
        }
    }

    // Handle watchlistdata updates
    if (Array.isArray(detail) && detail.length >= 2) {
        const [data, page] = detail

        if (data && watchlistdata.value && Array.isArray(watchlistdata.value)) {
            // Handle different data formats
            if (data.t === 'dk' || data.t === 'df') {
                // Direct WebSocket feed format
                updateWatchlistDataFromWebSocket(data)
            } else if (data.tk || data.token) {
                // Processed quote format
                updateWatchlistData(data)
            }
        }
    } else if (detail && (detail.token || detail.tk || detail.t)) {
        // Handle single data object format
        const data = detail
        const token = data.token || data.tk || data.t

        // Also check watchlistdata for this token
        if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
            const wIndex = watchlistdata.value.findIndex((o) => o.token == token)
            if (wIndex >= 0) {
                if (data.t === 'dk' || data.t === 'df') {
                    updateWatchlistDataFromWebSocket(data)
                } else if (data.lp !== undefined || data.ch !== undefined || data.chp !== undefined) {
                    updateWatchlistData(data)
                }
            }
        }
    }
}

const updateWatchlistDataFromWebSocket = (wsData) => {
    // Map WebSocket field names to our data structure
    const token = wsData.tk || wsData.token
    const exchange = wsData.e || wsData.exchange

    if (!token) {
        return
    }

    // Try to find by token and exchange, or just token if exchange doesn't match
    let index = watchlistdata.value.findIndex(item =>
        item.token === token && item.exch === exchange
    )

    // If not found with exchange match, try just token
    if (index < 0) {
        index = watchlistdata.value.findIndex(item => item.token === token)
    }

    if (index >= 0) {
        const merged = mergeTick(token, wsData)

        // Save to simple cache for legacy use
        if (isFinite(merged.ltp)) {
            priceCache.value[token] = {
                ltp: merged.ltp,
                ch: merged.ch ?? 0,
                chp: merged.chp ?? 0
            }
        }

        // Update only provided keys
        const current = { ...watchlistdata.value[index] }
        if (typeof merged.ltp !== 'undefined') current.ltp = merged.ltp.toFixed(2)
        if (typeof merged.ch !== 'undefined') current.ch = merged.ch.toFixed(2)
        if (typeof merged.chp !== 'undefined') current.chp = merged.chp.toFixed(2)
        watchlistdata.value[index] = { ...watchlistdata.value[index], ...current }

        updateDOMElements(token, {
            ltp: current.ltp ?? watchlistdata.value[index].ltp ?? '0.00',
            ch: current.ch ?? watchlistdata.value[index].ch ?? '0.00',
            chp: current.chp ?? watchlistdata.value[index].chp ?? '0.00'
        })

        // Update cache after WebSocket update
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            saveWatchlistToCache(watchlistis.value, watchlistdata.value)
        }
    }
}

const updateWatchlistData = (data) => {

    const token = data.token || data.tk
    const index = watchlistdata.value.findIndex(item => item.token === token)

    if (index >= 0) {
        const merged = mergeTick(token, data)

        // cache
        if (isFinite(merged.ltp)) {
            priceCache.value[token] = {
                ltp: merged.ltp,
                ch: merged.ch ?? 0,
                chp: merged.chp ?? 0
            }
        }

        const current = { ...watchlistdata.value[index] }
        if (typeof merged.ltp !== 'undefined') current.ltp = merged.ltp.toFixed(2)
        if (typeof merged.ch !== 'undefined') current.ch = merged.ch.toFixed(2)
        if (typeof merged.chp !== 'undefined') current.chp = merged.chp.toFixed(2)
        watchlistdata.value[index] = { ...watchlistdata.value[index], ...current }

        updateDOMElements(token, {
            ltp: current.ltp ?? watchlistdata.value[index].ltp ?? '0.00',
            ch: current.ch ?? watchlistdata.value[index].ch ?? '0.00',
            chp: current.chp ?? watchlistdata.value[index].chp ?? '0.00'
        })

        // Update cache after WebSocket update
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            saveWatchlistToCache(watchlistis.value, watchlistdata.value)
        }
    }
}

const updateDOMElements = (token, prices) => {
    // Update DOM elements directly for better performance
    const ltpElement = document.getElementById(`${token}ltp`)
    const chElement = document.getElementById(`${token}ch`)
    const chpElement = document.getElementById(`${token}chp`)

    if (ltpElement) {
        // Template already has ₹ symbol, so only update the number value
        ltpElement.textContent = prices.ltp || '0.00'
    }
    if (chElement) {
        chElement.textContent = formatPriceChange(prices.ch)
        chElement.className = `change-value ${getPriceChangeClass(prices.ch)}`
    }
    if (chpElement) {
        // Template shows ({{ formatPercentageChange(item.chp) }}), so wrap in parentheses
        chpElement.textContent = `(${formatPercentageChange(prices.chp)})`
        chpElement.className = `change-percent ${getPriceChangeClass(prices.chp)}`
    }
}

// Hover scroll functionality (watchlist only)
const handleMouseEnter = () => {
    isHoveringWatchlist.value = true
}

const handleMouseLeave = () => {
    isHoveringWatchlist.value = false
    // Clear cache on mouse leave
    cachedScrollInfo = null
}

// Optimized scroll handler - direct updates for minimal lag
const handleWheelScroll = (event) => {
    if (!stocksContainer.value || !isHoveringWatchlist.value) {
        return
    }

    const container = stocksContainer.value

    // Only recalculate scroll info if scroll position changed significantly or cache invalid
    const currentScrollTop = container.scrollTop
    const needsRecalc = !cachedScrollInfo || Math.abs(currentScrollTop - lastScrollTop) > 10

    if (needsRecalc) {
        const scrollHeight = container.scrollHeight
        const clientHeight = container.clientHeight
        const hasScrollableContent = scrollHeight > clientHeight

        cachedScrollInfo = {
            hasScrollableContent,
            scrollHeight,
            clientHeight,
            isAtTop: currentScrollTop <= 1,
            isAtBottom: Math.abs(currentScrollTop + clientHeight - scrollHeight) <= 1
        }
        lastScrollTop = currentScrollTop
    }

    const { hasScrollableContent, isAtTop, isAtBottom } = cachedScrollInfo

    if (hasScrollableContent) {
        // If we can scroll within the container, prevent page scroll and scroll container directly
        if ((event.deltaY > 0 && !isAtBottom) || (event.deltaY < 0 && !isAtTop)) {
            event.preventDefault()
            event.stopPropagation()
            // Direct scroll assignment for immediate response (lower latency than RAF)
            container.scrollTop += event.deltaY
            lastScrollTop = container.scrollTop
            // Update boundary cache after scroll for next event
            cachedScrollInfo.isAtTop = container.scrollTop <= 1
            cachedScrollInfo.isAtBottom = Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight) <= 1
        } else if ((event.deltaY > 0 && isAtBottom) || (event.deltaY < 0 && isAtTop)) {
            // At boundaries - prevent page scroll when at container limits
            event.preventDefault()
            event.stopPropagation()
        }
    }
}

// Exchange filter for stocks
const searchFilter = () => {
    items.value = []
    if (stocksexch.value == 0) {
        items.value = allitems.value
    } else if (stocksexch.value >= 1 && stocksexch.value <= 4) {
        for (let s = 0; s < allitems.value.length; s++) {
            if (stocksexch.value == 1 && (allitems.value[s].exch == "NSE" || allitems.value[s].exch == "BSE")) {
                items.value.push(allitems.value[s])
            } else if (stocksexch.value == 2 && (allitems.value[s].exch == "NFO" || allitems.value[s].exch == "BFO")) {
                items.value.push(allitems.value[s])
            } else if (stocksexch.value == 3 && allitems.value[s].exch == "CDS") {
                items.value.push(allitems.value[s])
            } else if (stocksexch.value == 4 && allitems.value[s].exch == "MCX") {
                items.value.push(allitems.value[s])
            }
        }
    } else {
        items.value = []
        nodata.value = "noooo"
    }
    isLoading.value = false
}

// Watchlist sorting/filtering
const setMWfilter = () => {
    if (!watchlistdata.value || !Array.isArray(watchlistdata.value) || watchlistdata.value.length === 0) return

    const filterKey = mwfilter.value
    if (filterKey === "a") {
        watchlistdata.value.sort((a, b) => {
            const aSym = (a.tsyms || a.tsym || '').toString()
            const bSym = (b.tsyms || b.tsym || '').toString()
            return aSym.localeCompare(bSym)
        })
    } else if (filterKey === "z") {
        watchlistdata.value.sort((a, b) => {
            const aSym = (a.tsyms || a.tsym || '').toString()
            const bSym = (b.tsyms || b.tsym || '').toString()
            return bSym.localeCompare(aSym)
        })
    } else if (filterKey === "ltp-h") {
        watchlistdata.value.sort((a, b) => {
            const aLtp = parseFloat(a.ltp) || 0
            const bLtp = parseFloat(b.ltp) || 0
            return bLtp - aLtp
        })
    } else if (filterKey === "ltp-l") {
        watchlistdata.value.sort((a, b) => {
            const aLtp = parseFloat(a.ltp) || 0
            const bLtp = parseFloat(b.ltp) || 0
            return aLtp - bLtp
        })
    } else if (filterKey === "ch-h") {
        watchlistdata.value.sort((a, b) => {
            const aChp = parseFloat(a.chp) || 0
            const bChp = parseFloat(b.chp) || 0
            return bChp - aChp
        })
    } else if (filterKey === "ch-l") {
        watchlistdata.value.sort((a, b) => {
            const aChp = parseFloat(a.chp) || 0
            const bChp = parseFloat(b.chp) || 0
            return aChp - bChp
        })
    }

    // Trigger reactivity update by reassigning
    watchlistdata.value = [...watchlistdata.value]
}

// Mutual Fund Methods
// Mutual fund API search
const setmfserach = async (setext) => {
    mfwatchlistdata.value = []
    searchloading.value = true

    try {
        const response = await fetch('https://v3.mynt.in/mfapi/dashboard/mfsearch', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: setext
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()
        searchloading.value = false

        if (result.data) {
            const data = result.data
            const watchlistSet = new Set(mfuseritem.value.map(item => item.ISIN))

            mfwatchlistdata.value = data.map(item => ({
                ...item,
                watchlist: watchlistSet.has(item.ISIN)
            }))
        }
    } catch (error) {
        console.error('Mutual fund search error:', error)
        searchloading.value = false
        appStore.showSnackbar(0, 'Failed to search mutual funds')
    }
}

// Focus mutual fund search input
const putMWfocus = () => {
    setTimeout(() => {
        const mwref = document.querySelector('.mf-search-input')
        if (mwref) {
            const input = mwref.querySelector('input')
            if (input) input.focus()
        }
    }, 10)
}

// Handle mutual fund search input (with uppercase conversion)
const handleMFSearchInput = (event) => {
    if (event && event.target) {
        mfsearch.value = event.target.value.toUpperCase()
        setmfserach(mfsearch.value)
    } else {
        setmfserach(mfsearch.value)
    }
}

const mutfndsearch = async (val) => {
    if (!val || val.length <= 2 || !allmutualfunds.value?.data) {
        addscript.value = false
        return
    }

    addscript.value = true
    searchloading.value = true
    nodata.value = null

    let data = allmutualfunds.value.data.filter(obj =>
        JSON.stringify(obj).toUpperCase().includes(val.toUpperCase())
    )

    if (data.length) {
        mutualuseritems.value = data.slice(0, 25)

        mutualuseritems.value.forEach(so => {
            if (mfuseritem.value.some(o => o.Scheme_Code === so.Scheme_Code)) {
                so["watchlist"] = true
            }
        })

        mfsearchFilter()
    } else {
        nodata.value = "noooo"
        mutualuseritems.value = []
        mfwatchlistdata.value = []
    }

    searchloading.value = false
}

const mfsearchFilter = () => {
    mfwatchlistdata.value = []
    if (mfexch.value == 0) {
        mfwatchlistdata.value = mutualuseritems.value
    } else {
        for (let f = 0; f < mutualuseritems.value.length; f++) {
            if (mfexch.value == 1 && mutualuseritems.value[f].splitt == "EQUITY") {
                mfwatchlistdata.value.push(mutualuseritems.value[f])
            } else if (mfexch.value == 2 && mutualuseritems.value[f].splitt == "DEBT") {
                mfwatchlistdata.value.push(mutualuseritems.value[f])
            } else if (mfexch.value == 3 && mutualuseritems.value[f].splitt == "HYBRID") {
                mfwatchlistdata.value.push(mutualuseritems.value[f])
            } else if (mfexch.value == 4 && (mutualuseritems.value[f].splitt == "OTHERS" || mutualuseritems.value[f].splitt == "SOLUTIONORIENTED")) {
                mfwatchlistdata.value.push(mutualuseritems.value[f])
            }
        }
    }
}

const setMFFilter = () => {
    if (!mfuseritem.value || !Array.isArray(mfuseritem.value)) return

    const filterKey = mffilter.value
    if (filterKey === "a") {
        mfuseritem.value.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (filterKey === "z") {
        mfuseritem.value.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    } else if (filterKey === "nav-h") {
        mfuseritem.value.sort((a, b) => (Number(b.AUM) || 0) - (Number(a.AUM) || 0))
    } else if (filterKey === "nav-l") {
        mfuseritem.value.sort((a, b) => (Number(a.AUM) || 0) - (Number(b.AUM) || 0))
    } else if (filterKey === "y-h") {
        mfuseritem.value.sort((a, b) => (Number(b["3Year"]) || 0) - (Number(a["3Year"]) || 0))
    } else if (filterKey === "y-l") {
        mfuseritem.value.sort((a, b) => (Number(a["3Year"]) || 0) - (Number(b["3Year"]) || 0))
    }
}

const getusedMutual = async (mode, item, del) => {
    // Check if user is logged in first
    const sessionStatus = sessionStorage.getItem('c3RhdHVz')
    const isLoggedIn = sessionStatus === 'dmFsaWR1c2Vy' && uid.value

    // If user not logged in and mode is not specified (initial load), silently return
    if (!isLoggedIn && !mode) {
        mfisLoading.value = false
        return
    }

    // If user is logged in but session not ready, silently return (will retry later)
    if (isLoggedIn && !(await ensureSessionReady())) {
        mfisLoading.value = false
        return
    }

    // If user not logged in and mode is specified (user action), return
    if (!isLoggedIn) {
        mfisLoading.value = false
        return
    }

    mfisLoading.value = true
    let data

    if (mode == "add") {
        data = {
            client_code: uid.value,
            type: "add",
            isin: item.ISIN,
        }
    } else if (mode == "delete") {
        data = {
            client_code: uid.value,
            isin: item.ISIN,
            type: "delete",
        }
    } else {
        data = {
            client_code: uid.value,
        }
    }

    try {
        console.log('[API] Calling watchlist_for_mobile (getMFwatchlist)...', { mode, hasItem: !!item, del })
        let res = await getMFwatchlist(JSON.stringify(data))
        console.log('[API] watchlist_for_mobile Response:', res)
        var showdata = []

        if (res.scripts && res.scripts.length > 0 && res.stat == "Ok" && !res.msg) {
            showdata = res.scripts
        } else if (res.msg == "script added" && res.stat == "Ok") {
            showdata = res.scripts
        } else if (res.msg == "script deleted" && res.stat == "Ok") {
            mfuseritem.value.splice(del, 1)
        } else if (res.scripts != "No data" && mode) {
            appStore.showSnackbar(0, res.msg ? res.msg : res)
        }

        if (showdata && showdata.length > 0) {
            for (let w = 0; w < showdata.length; w++) {
                let arr = showdata[w].Scheme_Name.split("-").slice(0)
                for (let d = 0; d < arr.length; d++) {
                    showdata[w]["splito"] = arr[d].includes("GROWTH") ? "GROWTH" : arr[d].includes("IDCW PAYOUT") ? "IDCW PAYOUT" : arr[d].includes("IDCW REINVESTMENT") ? "IDCW REINVESTMENT" : arr[d].includes("IDCW") ? "IDCW" : "NORMAL"
                }
                showdata[w]["splitt"] = showdata[w].Scheme_Type.toUpperCase()
            }
            mfuseritem.value = showdata

            const watchlistSet = new Set(mfuseritem.value.map(item => item.ISIN))
            mfwatchlistdata.value = mfwatchlistdata.value.map(item => ({
                ...item,
                watchlist: watchlistSet.has(item.ISIN)
            }))

            setMFFilter()
        }
    } catch (error) {
        console.error('Mutual fund watchlist error:', error)
        appStore.showSnackbar(0, 'Failed to update mutual fund watchlist')
    } finally {
        mfisLoading.value = false
    }
}

const deleteuserMutual = (item) => {
    let del = mfuseritem.value.indexOf(item)
    getusedMutual("delete", item, del)
}

const setSinglepage = (item) => {
    let path = window.location.pathname
    if (path == "/mutualfund/single") {
        window.dispatchEvent(new CustomEvent('ssdmf-event', { detail: item }))
    } else {
        router.push({ name: "mutual fund single", params: item })
    }
}

const putMForder = (value, item) => {
    window.dispatchEvent(new CustomEvent('menudialog', { detail: { type: "mforder", item: item, value: value } }))
}

// Options Chain Basket Methods
const getOBMargin = async () => {
    if (!optchainbasketdata.value || optchainbasketdata.value.length === 0) {
        totalmargin.value = 0
        postTrademargin.value = 0
        return
    }

    let item = { basketlists: [] }

    for (let i = 0; i < optchainbasketdata.value.length; i++) {
        const opta = optchainbasketdata.value[i]
        if (!opta.basketlists) {
            opta.basketlists = []
        }
        if (opta.basketlists.length === 0 && i > 0) {
            opta.basketlists.push({
                uid: uid.value,
                actid: uid.value,
                discqty: "0",
                exch: opta.exch,
                pCode: "I",
                prctyp: opta.ordvai,
                prd: "I",
                prc: opta.ordvai == "MKT" ? "" : opta.ordprc,
                qty: String(opta.ls * opta.ordlot),
                ret: "DAY",
                symbol_id: opta.token,
                tsym: opta.tsym,
                trantype: opta.buySell == "BUY" ? "B" : "S",
                trgprc: "0",
            })
        }

        if (opta.basketlists && opta.basketlists.length > 0) {
            item.basketlists.push(...opta.basketlists)
        }
    }

    if (item.basketlists.length > 0) {
        try {
            let marginData = await getBSKMargin(item)
            totalmargin.value = marginData.marginused == undefined ? 0 : marginData.marginused
            postTrademargin.value = marginData.marginusedtrade == undefined ? 0 : marginData.marginusedtrade
        } catch (error) {
            console.error('Margin calculation error:', error)
            totalmargin.value = 0
            postTrademargin.value = 0
        }
    } else {
        totalmargin.value = 0
        postTrademargin.value = 0
    }
}

const setBskmodify = (o, key, value) => {
    if (key == "delete") {
        optchainbasketdata.value.splice(o, 1)
        getOBMargin()
    } else {
        if (optchainbasketdata.value[o]) {
            optchainbasketdata.value[o][key] = value
            getOBMargin()
        }
    }
}

const setBfoPlaceorder = async (i) => {
    if (!(await ensureSessionReady())) return

    orderloader.value = true
    if (i <= optchainbasketdata.value.length - 1) {
        await setPlaceorder(optchainbasketdata.value[i], i)
    } else {
        appStore.showSnackbar(1, `Basket order placed successfully`)
        window.dispatchEvent(new CustomEvent('orderbook-update', { detail: "orders" }))
        orderloader.value = false
    }
}

const setPlaceorder = async (data, i) => {
    if (!(await ensureSessionReady())) return

    let item = {
        uid: uid.value,
        actid: uid.value,
        exch: data.exch,
        tsym: data.tsym,
        ret: "DAY",
        qty: String(Number(data.ls) * Number(data.ordlot)),
        prc: data.ordvai == "MKT" ? "0" : data.ordprc,
        prd: prdordplace.value ? "I" : "M",
        trantype: data.buySell == "BUY" ? "B" : "S",
        prctyp: data.ordvai,
        trailprc: "",
        channel: "",
        userAgent: "",
        appInstaId: "",
        trgprc: "0",
        mktProt: "",
    }

    try {
        let odata = await getPlaceOrder(item)
        if (odata.stat != "Ok") {
            appStore.showSnackbar(0, odata.emsg ? odata.emsg : odata)
            orderloader.value = false
            return
        }
        setTimeout(() => {
            setBfoPlaceorder(i + 1)
        }, 100)
    } catch (error) {
        console.error('Place order error:', error)
        appStore.showSnackbar(0, 'Failed to place order')
        orderloader.value = false
    }
}

// Flags to prevent duplicate API calls
const tradingDataCalled = ref(false)
const advdecIndicesCalled = ref(false)
const initialIndicesDataCalled = ref(false)

// Trading Data API Methods (PositionBook, Holdings, OrderBook, Limits)
const getPositionbook = async () => {
    if (!(await ensureSessionReady())) return

    try {
        console.log('[API] Calling PositionBook...')
        const data = await getMPosotion(true)
        console.log('[API] PositionBook Response:', data)
        // Note: Data can be stored in Pinia store if needed for other components
    } catch (error) {
        console.error('[API] PositionBook Error:', error)
    }
}

const getHoldingbook = async () => {
    if (!(await ensureSessionReady())) return

    try {
        console.log('[API] Calling Holdings...')
        const data = await getMHoldings(true)
        console.log('[API] Holdings Response:', data)
        // Note: Data can be stored in Pinia store if needed for other components
    } catch (error) {
        console.error('[API] Holdings Error:', error)
    }
}

const getOrderbook = async () => {
    if (!(await ensureSessionReady())) return

    try {
        console.log('[API] Calling OrderBook...')
        const data = await getMOrderbook()
        console.log('[API] OrderBook Response:', data)
        // Note: Data can be stored in Pinia store if needed for other components
    } catch (error) {
        console.error('[API] OrderBook Error:', error)
    }
}

const getLimits = async () => {
    if (!(await ensureSessionReady())) return

    try {
        console.log('[API] Calling Limits...')
        const data = await getMLimits(true)
        console.log('[API] Limits Response:', data)
        // Note: Data can be stored in Pinia store if needed for other components
    } catch (error) {
        console.error('[API] Limits Error:', error)
    }
}

// Call all trading data APIs together (prevents duplicate calls)
const callTradingDataAPIs = async () => {
    if (tradingDataCalled.value) {
        console.log('[API] Trading data APIs already called, skipping...')
        return
    }

    // Set flag BEFORE calling to prevent concurrent calls
    tradingDataCalled.value = true
    console.log('[API] Calling trading data APIs after login...')

    try {
        await Promise.all([
            getPositionbook(),  // PositionBook API
            getHoldingbook(),   // Holdings API
            getOrderbook(),     // OrderBook API
            getLimits(),        // Limits API
        ])
    } catch (error) {
        console.error('[API] Error calling trading data APIs:', error)
        // Reset flag on error so it can be retried
        tradingDataCalled.value = false
    }
}

// Index Management Methods
const getAllindicedata = async (item, callback) => {
    // Always open dialog first (like old app behavior)
    if (item && callback !== undefined && callback !== null) {
        console.log('[API] Opening index dialog for:', { item, callback, pdmwdataLength: pdmwdata.value.length })

        // Set singleindex to the current card item (like old app line 1771)
        singleindex.value = { ...item }
        // Set the token of the card being edited for comparison (like old app: this.singleindex["n"] = this.pdmwdata[callback].token)
        if (pdmwdata.value && pdmwdata.value[callback] !== undefined) {
            singleindex.value.n = pdmwdata.value[callback].token
            // Also set token to find the card when updating (like old app uses singleindex.token in setChangeindex)
            singleindex.value.token = pdmwdata.value[callback].token
        }

        // Open dialog immediately (like old app line 1770)
        indexdialog.value = true

        // Reset expansion panel to show first panel by default
        indexpanel.value = [0]

        console.log('[API] Index dialog opened, singleindex:', singleindex.value, 'indexdialog:', indexdialog.value)
    }

    // Then fetch index data (like old app line 1765)
    if (!(await ensureSessionReady())) return

    try {
        console.log('[API] Calling getadindices (getIndexList)...')
        let data = await getIndexList()
        console.log('[API] getadindices Response:', data)

        // Match old app structure exactly (like old app line 1766)
        if (data && data.stat == "Ok") {
            // Old app assigns directly from data object (line 1767-1769)
            allindex.value = { NSE: [], BSE: [], MCX: [] }

            // Try direct access first (like old app)
            if (data.NSE) allindex.value.NSE = data.NSE
            if (data.BSE) allindex.value.BSE = data.BSE
            if (data.MCX) allindex.value.MCX = data.MCX

            // Also check if data has values property (for compatibility with new API)
            if ((!data.NSE || data.NSE.length === 0) && data.values) {
                if (data.values.NSE) allindex.value.NSE = data.values.NSE
                if (data.values.BSE) allindex.value.BSE = data.values.BSE
                if (data.values.MCX) allindex.value.MCX = data.values.MCX
            }

            console.log('[API] Allindex populated:', {
                NSE: allindex.value.NSE.length,
                BSE: allindex.value.BSE.length,
                MCX: allindex.value.MCX.length
            })
        } else {
            console.warn('[API] getIndexList response not OK:', data)
        }
    } catch (error) {
        console.error('[API] Get index list error:', error)
        // Dialog is already open, so user can still see it even if API fails
    }
}

// Advance/Decline Indices API Method
const getAdvdecIndices = async () => {
    if (!(await ensureSessionReady())) return
    if (advdecIndicesCalled.value) {
        console.log('[API] getadindicesAdvdec already called, skipping...')
        return
    }

    advdecIndicesCalled.value = true
    try {
        console.log('[API] Calling getadindicesAdvdec (getADindices)...')
        const data = await getADindices()
        console.log('[API] getadindicesAdvdec Response:', data)
        // Note: Data can be stored in Pinia store if needed for other components
    } catch (error) {
        console.error('[API] getadindicesAdvdec Error:', error)
    }
}

const setChangeindex = async (item, exch) => {
    if (!(await ensureSessionReady())) return

    try {
        // Find which card is being edited by comparing token (like old app line 1776)
        // Use singleindex.token which was set in getAllindicedata
        const i = pdmwdata.value.findIndex((o) => o.token === singleindex.value.token)

        if (i >= 0) {
            // Update the card with new index data (like old app line 1777)
            // Match old app exactly: only update exch, token, tsym (don't preserve price data)
            // Regenerate key based on new index
            const newKey = `${item.idxname || item.tsym || 'Unknown'}:${exch}`
            pdmwdata.value[i] = {
                key: newKey,
                exch: exch,
                token: item.token,
                tsym: item.idxname || item.tsym || '',
                // Clear price data to force refresh (like old app doesn't preserve ltp/ch/chp)
                ltp: null,
                ch: null,
                chp: null
            }

            // Update singleindex for dialog state (like old app line 1778)
            singleindex.value = item

            // Close dialog (like old app line 1779)
            indexdialog.value = false

            // Save to localStorage (like old app line 1780)
            if (uid.value) {
                localStorage.setItem(`${uid.value}_pdmwdata`, JSON.stringify(pdmwdata.value))
            }

            // Unsubscribe from old WebSocket data first (best practice)
            const oldPdEvent = new CustomEvent('web-scoketOn', {
                detail: { flow: 'unsub', data: pdmwdata.value, is: 'pd', page: 'watchlist' }
            })
            window.dispatchEvent(oldPdEvent)

            // Re-subscribe to WebSocket with updated data (like old app line 1781)
            // Old app uses setWebsocket("sub", this.pdmwdata, "pd", "watchlist")
            // Which emits: eventBus.$emit("web-scoketOn", "sub", this.pdmwdata, "pd", "watchlist")
            if (pdmwdata.value && pdmwdata.value.length > 0) {
                const pdEvent = new CustomEvent('web-scoketOn', {
                    detail: { flow: 'sub', data: pdmwdata.value, is: 'pd', page: 'watchlist' }
                })
                window.dispatchEvent(pdEvent)
            }

            // Fetch initial LTP data for updated card (new requirement to show data immediately)
            // Reset flag to allow fetching again
            initialIndicesDataCalled.value = false
            await fetchInitialIndicesData()
        }
    } catch (error) {
        console.error('Change index error:', error)
    }
}

// Fetch initial LTP data for pdmwdata (top indices cards)
// This ensures data is available immediately on mount and after refresh
const fetchInitialIndicesData = async () => {
    if (initialIndicesDataCalled.value) {
        console.log('[API] GetLtp (fetchInitialIndicesData) already called, skipping...')
        return
    }

    if (!pdmwdata.value || pdmwdata.value.length === 0) {
        console.log('fetchInitialIndicesData: pdmwdata is empty')
        return
    }

    // Ensure session is ready before making API calls
    if (!(await ensureSessionReady())) {
        console.log('fetchInitialIndicesData: Session not ready')
        return
    }

    initialIndicesDataCalled.value = true

    try {
        // Prepare data array for API call
        const indicesData = pdmwdata.value.map(item => ({
            exch: item.exch,
            token: item.token,
            tsym: item.tsym || item.tsym
        }))

        console.log('fetchInitialIndicesData: Fetching data for', indicesData.length, 'indices')

        // Fetch LTP data for all indices
        const response = await getLtpdata(indicesData)
        const raw = response?.data

        if (raw) {
            console.log('fetchInitialIndicesData: Received data for', Object.keys(raw).length, 'tokens')
            let anyUpdated = false

            for (let l = 0; l < pdmwdata.value.length; l++) {
                const item = pdmwdata.value[l]
                const v = raw[item.token]

                if (v) {
                    const newLtp = Number(v.lp || v.ltp || 0).toFixed(2)
                    const prevClose = Number(v.close || v.prev_close_price || 0)
                    const newCh = prevClose > 0 ? Number(newLtp - prevClose).toFixed(2) : (Number(v.ch || 0).toFixed(2))
                    const newChp = prevClose > 0 ? Number((newCh / prevClose) * 100).toFixed(2) : (Number(v.chp || 0).toFixed(2))

                    // Update pdmwdata values
                    pdmwdata.value[l]["ltp"] = newLtp
                    pdmwdata.value[l]["ch"] = newCh
                    pdmwdata.value[l]["chp"] = newChp
                    anyUpdated = true

                    // Update DOM elements immediately
                    await nextTick()
                    const ltpTag = document.getElementById(`p${item.token}ltp`)
                    if (ltpTag) {
                        ltpTag.innerHTML = newLtp
                        const chTag = document.getElementById(`p${item.token}ch`)
                        const chpTag = document.getElementById(`p${item.token}chp`)
                        const chpclrTag = document.getElementById(`p${item.token}chpclr`)

                        if (chTag) chTag.innerHTML = newCh
                        if (chpTag) chpTag.innerHTML = ` (${newChp}%)`
                        if (chpclrTag) {
                            const ch = parseFloat(newCh) || 0
                            chpclrTag.className = ch > 0
                                ? 'd-inline-flex font-weight-medium fs-12 px-2 maingreen--text'
                                : ch < 0
                                    ? 'd-inline-flex font-weight-medium fs-12 px-2 mainred--text'
                                    : 'd-inline-flex font-weight-medium fs-12 px-2 subtext--text'
                        }
                    }
                } else {
                    console.log('fetchInitialIndicesData: No data for token', item.token)
                }
            }

            // Save to cache after updating all prices
            if (anyUpdated && uid.value) {
                try {
                    localStorage.setItem(`${uid.value}_pdmwdata`, JSON.stringify(pdmwdata.value))
                } catch (err) {
                    console.error('Error saving pdmwdata cache:', err)
                }
            }
        }
    } catch (error) {
        console.error('fetchInitialIndicesData error:', error)
    }
}

// Client Exchange Methods
const getClientexch = async () => {
    if (!(await ensureSessionReady())) return

    try {
        console.log('[API] Calling ClientDetails...')
        let res = await getClientDetails()
        console.log('[API] ClientDetails Response:', res)
        if (res && res.stat == "Ok") {
            clientdetails.value = res
        }
    } catch (error) {
        console.error('[API] ClientDetails Error:', error)
    }
}

// Watchlist tabs drag scroll handlers
const handleTabsMouseDown = (e) => {
    if (!watchlistTabsContainer.value) return
    // Only start dragging on left mouse button
    if (e.button !== 0) return

    isDraggingTabs.value = true
    tabsStartX = e.pageX - watchlistTabsContainer.value.offsetLeft
    tabsScrollLeft = watchlistTabsContainer.value.scrollLeft
    watchlistTabsContainer.value.style.cursor = 'grabbing'

    // Add global mouse move and mouse up listeners
    document.addEventListener('mousemove', handleTabsMouseMoveGlobal)
    document.addEventListener('mouseup', handleTabsMouseUpGlobal)

    e.preventDefault()
    e.stopPropagation()
}

const handleTabsMouseMove = (e) => {
    if (!isDraggingTabs.value || !watchlistTabsContainer.value) return
    e.preventDefault()
    e.stopPropagation()
    const x = e.pageX - watchlistTabsContainer.value.offsetLeft
    const walk = (x - tabsStartX) * 2 // Scroll speed multiplier
    watchlistTabsContainer.value.scrollLeft = tabsScrollLeft - walk
}

// Global mouse move handler for drag scrolling
const handleTabsMouseMoveGlobal = (e) => {
    if (!isDraggingTabs.value || !watchlistTabsContainer.value) return
    e.preventDefault()
    const x = e.pageX - watchlistTabsContainer.value.offsetLeft
    const walk = (x - tabsStartX) * 2 // Scroll speed multiplier
    watchlistTabsContainer.value.scrollLeft = tabsScrollLeft - walk
}

// Global mouse up handler for drag scrolling
const handleTabsMouseUpGlobal = () => {
    isDraggingTabs.value = false
    if (watchlistTabsContainer.value) {
        watchlistTabsContainer.value.style.cursor = 'grab'
    }
    // Remove global listeners
    document.removeEventListener('mousemove', handleTabsMouseMoveGlobal)
    document.removeEventListener('mouseup', handleTabsMouseUpGlobal)
}

const handleTabsMouseUp = () => {
    handleTabsMouseUpGlobal()
}

// Utility Methods
const setEscape = () => {
    if (watchsecti.value) {
        watchsecti.value = false
    }
    if (addscript.value) {
        addscript.value = false
    }
    search.value = ''
    mfsearch.value = ''
    optsearch.value = false
    optsearchdata.value = {}
}

const onMWClear = () => {
    items.value = []
    nodata.value = 'noooo'
    searchloading.value = false
    stksearch.value = null
    mfsearch.value = ""
    optsearch.value = false
    optsearchdata.value = {}
    setEscape()
}

// Stock Details Navigation (like Vue 2 setSSDtab)
const setSSDtab = (type, token, exch, tsym) => {
    console.log('setSSDtab called:', { type, token, exch, tsym })

    if (type === "alert") {
        const event = new CustomEvent('menudialog', {
            detail: { type: "alert", token, exch, tsym }
        })
        window.dispatchEvent(event)
    } else if (type === "cGTT") {
        const event = new CustomEvent('menudialog', {
            detail: { type: "order-GTT", token, exch, tsym, trans: "b" }
        })
        window.dispatchEvent(event)
    } else {
        const path = window.location
        const val = [type, token, exch, tsym]

        // Store params in localStorage before navigation (Vue Router doesn't preserve params for static routes)
        localStorage.setItem('ssdParams', JSON.stringify(val))
        localStorage.setItem('ssdtsym', `${exch}:${tsym}`)
        localStorage.setItem('ssdtoken', token)

        console.log('Navigating to stocks details with params:', val)

        if (path.pathname !== "/stocks/details") {
            // Use query params for persistence (works on refresh)
            router.push({
                name: "stocks details",
                params: { val },
                query: {
                    type: type,
                    token: token,
                    exch: exch,
                    tsym: tsym
                }
            })
        } else {
            const event = new CustomEvent('ssd-event', {
                detail: { type, token, exch, tsym }
            })
            window.dispatchEvent(event)
        }
    }
}

// Handle Menu Dialog (like Vue 2 eventBus.$emit('menudialog'))
const handleMenuDialog = (type, token, exch, tsym, trantype) => {
    const event = new CustomEvent('menudialog', {
        detail: { type, token, exch, tsym, trantype }
    })
    window.dispatchEvent(event)
}

// Holdings Badge (like Vue 2 setHoldbadge)
const setHoldbadge = (tk) => {
    const data = getMHoldingdata()
    if (!data || !Array.isArray(data) || data.length === 0) return ''

    const holding = data.find(x => x.token == tk || (x.exch_tsym && x.exch_tsym[0] && x.exch_tsym[0].token == tk))
    const netqty = holding?.netqty || holding?.exch_tsym?.[0]?.netqty || null

    return setHoldcount(netqty)
}

// Holdings Count HTML (like Vue 2 setHoldcount)
const setHoldcount = (ct) => {
    if (ct > 0) {
        return `
            <span style="border-radius: 4px; padding: 0px 6px; background-color: #F1F3F8 !important"
                class="mr-1 table-hov-prd d-inline-flex align-center">
                <img width="13px" src="/src/assets/suitcase.svg" />
                <span class="font-weight-medium fs-12 pl-1 pt-1 primary--text"> ${ct}</span>
            </span>`
    }
    return ''
}

// Watch Unique ID (like Vue 2 setWatchUnique)
const setWatchUnique = (i, x) => {
    return i >= 0 ? x : (watchlistdata.value[x].id = x)
}

// Lifecycle
// Note: Mutual funds data is loaded via setappbar-event (like Vue 2)
// No direct API call needed - data comes from event handler

// Handle setappbar-event for mutual funds data (like Vue 2)
const handleSetAppBarEvent = (event) => {
    const { data, value } = event.detail || {}

    // Handle mutual funds data from event (like Vue 2 line 952-960)
    if (value == 1 && data) {
        panel.value = true
        allmutualfunds.value = data
        // Load user's mutual fund watchlist if logged in
        if (uid.value) {
            getusedMutual()
        }
    } else if (value === "Mutual Fund") {
        panel.value = true
    } else {
        panel.value = false
    }
}

// Check pathname on mount to set panel state
const checkPathForPanel = () => {
    const path = window.location.pathname
    if (path.includes("mutualfund")) {
        panel.value = true
    } else {
        panel.value = false
    }
}

// Handle bskwatch-event to add symbols to options basket (like Vue 2)
const handleBskWatchEvent = (event) => {
    const { type, data } = event.detail || {}

    if (data) {
        let index = optchainbasketdata.value.findIndex((x) => x.tsym == data.tsym)
        if (index == -1) {
            // Process symbol data (like Vue 2)
            const ser = data.tsym.includes("SENSEX") && data.tsym.includes(" ")
                ? data.dname.split(" ")
                : data.tsym.split(/(\d+)/)

            data["ser"] = ser
            data["tsyms"] = ser[0]
            data.checkbox = true
            data["exp"] = `${ser[5] ? ser[5] : ser[3] ? ser[3] : ""} ${ser[4] ? ser[4] : ""}${ser[4] && ser[4].includes("E") ? "" : "E"}`
            data.ser = `${ser[1]} ${ser[2]} ${ser[5] ? ser[3] : ""}`
            data.buySell = data.buySell || "BUY"
            data.ordvai = data.ordvai || "MKT"
            data.ordlot = data.ordlot || 1
            data.ordprc = data.ordprc || ""

            optchainbasketdata.value.push(data)
            getOBMargin()
        } else {
            appStore.showSnackbar(0, "This script is already exists.")
        }
    }
    optchainbasket.value = true
}

// Handle option-search event (like Vue 2)
const handleOptionSearchEvent = (event) => {
    const data = event.detail || {}

    optsearch.value = true
    optsearchdata.value = data
    items.value = []
    nodata.value = null
    addscript.value = true

    // Focus search input
    setTimeout(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) searchInput.focus()
    }, 100)

    // If there's a search query, trigger search
    if (stksearch.value && stksearch.value.length > 2) {
        performSearch()
    }
}

// Handle addscript-wl event (like Vue 2)
const handleAddScriptWL = (event) => {
    const detail = event.detail
    let data, type

    // Handle both array and object formats
    if (Array.isArray(detail)) {
        data = detail[0]
        type = detail[1]
    } else if (detail && typeof detail === 'object') {
        data = detail.data || detail
        type = detail.type
    } else {
        data = detail
        type = null
    }

    // Match old code: eventBus.$on("addscript-wl", (data, type) => { ... })
    if (type === 'searchss') {
        if (addscript.value !== true) {
            addscript.value = true
            watchsecti.value = false
            items.value = []
            nodata.value = null
            // putMWfocus equivalent - focus search input
            setTimeout(() => {
                const searchInput = document.querySelector('.search-input')
                if (searchInput) searchInput.focus()
            }, 100)
        }
    } else if (type === 'mf') {
        // Handle mutual fund add
        if (data) {
            getusedMutual('add', data, 'mf')
        }
    } else {
        // Default case: set model and open search/add dialog
        if (data) {
            model.value = data
            // Open search/add dialog by setting addscript to true
            addscript.value = true
            // If data has searchable text, set it and trigger search
            if (data.tsym || data.tsyms) {
                search.value = data.tsym || data.tsyms
                // Trigger search after a short delay
                setTimeout(() => {
                    performSearch()
                }, 100)
            }
        }
    }
}

onMounted(async () => {
    // Check pathname to set panel state (like Vue 2 created hook)
    checkPathForPanel()

    // Ensure listener is attached before any subscriptions
    if (!wsListenerAdded.value) {
        window.addEventListener('web-scoketConn', handleWebSocketUpdate)
        wsListenerAdded.value = true
    }

    // Listen for setappbar-event to receive mutual funds data (like Vue 2)
    // In Vue 2, allmutualfunds is set from this event, not from direct API call
    window.addEventListener('setappbar-event', handleSetAppBarEvent)

    // Listen for addscript-wl event (like Vue 2)
    window.addEventListener('addscript-wl', handleAddScriptWL)

    // Listen for bskwatch-event (options basket)
    window.addEventListener('bskwatch-event', handleBskWatchEvent)

    // Listen for option-search event
    window.addEventListener('option-search', handleOptionSearchEvent)

    // Get client exchange data
    await getClientexch()

    // Phase 2: Load PreDefinedMWRef data immediately (synchronously) so tabs work on first load
    // This is critical for predefined watchlist tabs to function immediately
    try {
        PreDefinedMWRef.value = await getPreDefinedMW()
    } catch (err) {
        console.log('PreDefinedMW load error in onMounted:', err)
        // Continue even if PreDefinedMW fails - will retry in setPDwatchlist if needed
    }

    // Check if user is logged in (like Vue 2 line 924-938)
    const sessionStatus = sessionStorage.getItem("c3RhdHVz")
    if (sessionStatus === "dmFsaWR1c2Vy" && uid.value && mtoken.value) {
        // User is logged in - load user watchlists (like Vue 2 line 932)
        await getWatchlist()
        // CRITICAL: getWatchlist() will set watchlistis.value to first watchlist (data[0])
        // So after getWatchlist(), watchlistis.value will already be set to first user watchlist

        // CRITICAL: Load user mutual fund watchlist on mount if logged in (like Vue 2 line 933)
        await getusedMutual()

        // NEW: Call trading data APIs in parallel (PositionBook, Holdings, OrderBook, Limits)
        // These are called on initial mount after login to match old app behavior
        await callTradingDataAPIs()

        // After getWatchlist, if watchlistis is a predefined watchlist (shouldn't happen normally),
        // load predefined data. Otherwise, getMWlistdata() should have been called by getWatchlist()
        if (watchlistis.value && PreMWlist.value.find(p => p.key === watchlistis.value)) {
            await setPDwatchlist()
        } else if (watchlistis.value && watchlist.value && watchlist.value.length > 0) {
            // If watchlistis is set to a user watchlist (default case after getWatchlist),
            // ensure data is loaded - getWatchlist() should have already called getMWlistdata()
            // but double-check
            if (!watchlistdata.value || (Array.isArray(watchlistdata.value) && watchlistdata.value.length === 0)) {
                await getMWlistdata()
            }
        }
    } else {
        // User not logged in - default to NIFTY50:NSE (like Vue 2 line 936)
        watchlistis.value = "NIFTY50:NSE"
        await setPDwatchlist()
    }

    // Ensure isLoading is false after all initialization
    // This is critical for data to display
    isLoading.value = false

    // Load pdmwdata from localStorage (like Vue 2 line 945-947)
    // This is critical for top indices (NIFTY50, NIFTYBANK) to work immediately
    const defaultPdmwdata = [
        { key: "NIFTY50:NSE", exch: "NSE", token: "26000", tsym: "Nifty 50" },
        { key: "NIFTYBANK:NSE", exch: "NSE", token: "26009", tsym: "Nifty Bank" },
    ]

    try {
        const storedPdmwdata = localStorage.getItem(`${uid.value}_pdmwdata`)
        if (storedPdmwdata) {
            const parsed = JSON.parse(storedPdmwdata)
            // Only use if it has exactly 2 items (like Vue 2)
            if (Array.isArray(parsed) && parsed.length === 2) {
                pdmwdata.value = parsed
            } else {
                pdmwdata.value = defaultPdmwdata
            }
        } else {
            pdmwdata.value = defaultPdmwdata
        }
    } catch (err) {
        console.log('pdmwdata load error:', err)
        pdmwdata.value = defaultPdmwdata
    }

    // Subscribe pdmwdata to WebSocket immediately (like Vue 2 line 947)
    // This is critical for top indices data to update in real-time
    if (pdmwdata.value && pdmwdata.value.length > 0) {
        const pdEvent = new CustomEvent('web-scoketOn', {
            detail: { flow: 'sub', data: pdmwdata.value, is: 'pd', page: 'watchlist' }
        })
        window.dispatchEvent(pdEvent)
    }

    // Load index data
    await getAllindicedata()

    // NEW: Call getadindicesAdvdec API if user is logged in
    // Only call once to prevent duplicates
    if (sessionStatus === "dmFsaWR1c2Vy" && uid.value && mtoken.value && !advdecIndicesCalled.value) {
        await getAdvdecIndices()
    }

    // Fetch initial LTP data for pdmwdata cards (ensures data shows on mount and after refresh)
    await fetchInitialIndicesData()

    // Warm-up re-subscribe after refresh to avoid stuck state
    setTimeout(() => {
        // Re-subscribe pdmwdata
        if (pdmwdata.value && pdmwdata.value.length > 0) {
            const pdEv = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: pdmwdata.value, is: 'pd', page: 'watchlist' }
            })
            window.dispatchEvent(pdEv)
        }

        // Re-subscribe watchlistdata
        // CRITICAL: Only subscribe if watchlistdata is an array with items (not "no data" string)
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            const ev = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(ev)
        }
    }, 1200)
})

onUnmounted(() => {
    // Clean up WebSocket subscription
    if (watchlistdata.value && Array.isArray(watchlistdata.value)) {
        const event = new CustomEvent('web-scoketOn', {
            detail: { flow: 'unsub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
        })
        window.dispatchEvent(event)
    }

    // Remove event listeners
    window.removeEventListener('web-scoketConn', handleWebSocketUpdate)
    window.removeEventListener('setappbar-event', handleSetAppBarEvent)
    window.removeEventListener('addscript-wl', handleAddScriptWL)
    window.removeEventListener('bskwatch-event', handleBskWatchEvent)
    window.removeEventListener('option-search', handleOptionSearchEvent)

    // Clean up scroll cache
    cachedScrollInfo = null

    // Clean up tabs drag scroll
    isDraggingTabs.value = false
    document.removeEventListener('mousemove', handleTabsMouseMoveGlobal)
    document.removeEventListener('mouseup', handleTabsMouseUpGlobal)
})

// Start WS and load watchlist immediately after login without refresh
watch([uid, mtoken], async ([newUid, newMtok]) => {
    const sessionStatus = sessionStorage.getItem('c3RhdHVz')
    if (sessionStatus === 'dmFsaWR1c2Vy' && newUid && newMtok) {
        // CRITICAL: Set loading state before data loads
        isLoading.value = true
        mfisLoading.value = true

        // Ensure WebSocket listener is attached
        if (!wsListenerAdded.value) {
            window.addEventListener('web-scoketConn', handleWebSocketUpdate)
            wsListenerAdded.value = true
        }

        // Load client exchange data first (like Vue 2 line 931)
        await getClientexch()

        // Phase 2: Load PreDefinedMWRef if not loaded yet (for predefined watchlist tabs to work)
        if (!PreDefinedMWRef.value || PreDefinedMWRef.value.stat !== "Ok") {
            try {
                PreDefinedMWRef.value = await getPreDefinedMW()
                console.log('Phase 2: PreDefinedMWRef loaded after login')
            } catch (err) {
                console.log('PreDefinedMW load error in watch:', err)
            }
        }

        // Phase 2: Force re-render of watchlist items after login to ensure hover options show
        await nextTick()
        console.log('Phase 2: Forcing re-render of watchlist items after login')

        // CRITICAL: Load user watchlists immediately after login (like Vue 2 line 932)
        await getWatchlist()

        // CRITICAL: Load user mutual fund watchlist immediately after login (like Vue 2 line 933)
        await getusedMutual()

        // NEW: Call trading data APIs in parallel after login (PositionBook, Holdings, OrderBook, Limits)
        // These are called when user logs in to match old app behavior
        // Only call if not already called in onMounted
        await callTradingDataAPIs()

        // CRITICAL: Re-subscribe watchlistdata to WebSocket after login if data exists
        // This ensures real-time updates work immediately after login
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            const wlEv = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(wlEv)
        }

        // Load pdmwdata from localStorage (like Vue 2 line 945-947)
        // This is critical for top indices to work immediately after login
        const defaultPdmwdata = [
            { key: "NIFTY50:NSE", exch: "NSE", token: "26000", tsym: "Nifty 50" },
            { key: "NIFTYBANK:NSE", exch: "NSE", token: "26009", tsym: "Nifty Bank" },
        ]

        try {
            const storedPdmwdata = localStorage.getItem(`${newUid}_pdmwdata`)
            if (storedPdmwdata) {
                const parsed = JSON.parse(storedPdmwdata)
                // Only use if it has exactly 2 items (like Vue 2)
                if (Array.isArray(parsed) && parsed.length === 2) {
                    pdmwdata.value = parsed
                } else {
                    pdmwdata.value = defaultPdmwdata
                }
            } else {
                pdmwdata.value = defaultPdmwdata
            }
        } catch (err) {
            console.log('pdmwdata load error in watch:', err)
            pdmwdata.value = defaultPdmwdata
        }

        // Subscribe pdmwdata to WebSocket immediately after login (like Vue 2 line 947)
        // This is critical for top indices data to update in real-time
        if (pdmwdata.value && pdmwdata.value.length > 0) {
            const pdEvent = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: pdmwdata.value, is: 'pd', page: 'watchlist' }
            })
            window.dispatchEvent(pdEvent)
        }

        // NEW: Call getadindicesAdvdec API after login (only if not already called)
        if (!advdecIndicesCalled.value) {
            await getAdvdecIndices()
        }

        // Fetch initial LTP data for pdmwdata cards after login
        // This ensures data shows immediately after login (only if not already called)
        if (!initialIndicesDataCalled.value) {
            await fetchInitialIndicesData()
        }

        // After getWatchlist, check if we need to load predefined watchlist
        // If watchlistis is a predefined watchlist, load it
        if (watchlistis.value && PreMWlist.value.find(p => p.key === watchlistis.value)) {
            await setPDwatchlist()
        } else if (!watchlistis.value || !watchlist.value || watchlist.value.length === 0) {
            // If no user watchlist, default to first predefined
            if (PreMWlist.value && PreMWlist.value.length > 0) {
                watchlistis.value = PreMWlist.value[0].key
                await setPDwatchlist()
            }
        }

        // Phase 1: CRITICAL: Re-subscribe watchlistdata to WebSocket after login
        // This ensures real-time updates work immediately after login
        if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
            console.log('Phase 1: Re-subscribing watchlistdata to WebSocket after login');
            const wlEvent = new CustomEvent('web-scoketOn', {
                detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
            })
            window.dispatchEvent(wlEvent)

            // Defensive re-subscription after delay to ensure connection is ready
            setTimeout(() => {
                if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
                    const wlEvent2 = new CustomEvent('web-scoketOn', {
                        detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
                    })
                    window.dispatchEvent(wlEvent2)
                }
            }, 500);

            // Second re-subscription for robustness
            setTimeout(() => {
                if (watchlistdata.value && Array.isArray(watchlistdata.value) && watchlistdata.value.length > 0) {
                    const wlEvent3 = new CustomEvent('web-scoketOn', {
                        detail: { flow: 'sub', data: watchlistdata.value, is: 'wl', page: 'watchlist' }
                    })
                    window.dispatchEvent(wlEvent3)
                }
            }, 1200);
        }

        // Ensure isLoading is false after all initialization
        // This is critical for data to display
        isLoading.value = false
        mfisLoading.value = false
    }
})
</script>

<script>

// For Vue 3 compatibility with directives
import { dragscroll } from 'vue-dragscroll'

export default {
    directives: {
        dragscroll
    }
}
</script>

<style scoped>
.watchlisttab {
    border-radius: 15px;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 12px;
    background-color: #F1F3F8;
}

.watchlisttab-active,
.watchlisttab:focus {
    /* background-color: #000; */
    background-color: black !important;
    color: white !important;
}

/* Ensure active state is always applied when active class is present */
.watchlisttab.watchlisttab-active {
    background-color: black !important;
    color: white !important;
}

/* Watchlist tabs scrollable container - drag scroll support */
.watchlist-tabs-scrollable {
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}

.watchlist-tabs-scrollable.dragging {
    cursor: grabbing !important;
}

.watchlist-tabs-scrollable:active {
    cursor: grabbing;
}

.watchlist-tabs-scrollable::-webkit-scrollbar {
    display: none;
}

.watchlist-tabs-scrollable {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.watchlist-tabs-scrollable * {
    pointer-events: auto;
    user-select: none;
}

/* Watchlist Management Section Styles */
.watchlist-manage-item {
    padding: 12px 8px !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s ease;

}

.watchlist-manage-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.watchlist-manage-item.active {
    background-color: rgba(25, 118, 210, 0.05);
}

.watchlist-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
}

.indicator-square {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background-color: #E0E0E0;
    border: 1px solid #BDBDBD;
    transition: all 0.2s ease;
}

.indicator-square.active {
    background-color: #1976D2;
    border-color: #1976D2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.watchlist-name {
    font-size: 14px;
    color: #000;
    letter-spacing: 0.01em;
}

.delete-btn {
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.delete-btn:hover {
    opacity: 1;
}

/* Dark theme adjustments for watchlist management */
.theme--dark .watchlist-manage-item {
    border-bottom-color: rgba(255, 255, 255, 0.08);
}

.theme--dark .watchlist-manage-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
}

.theme--dark .watchlist-manage-item.active {
    background-color: rgba(25, 118, 210, 0.15);
}

.theme--dark .indicator-square {
    background-color: #424242;
    border-color: #616161;
}

.theme--dark .indicator-square.active {
    background-color: #2196F3;
    border-color: #2196F3;
}

.watchlist-container {
    padding: 16px;
    max-width: 100%;
}

.watchlist-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    transition: background-color 0.2s;
}

.watchlist-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.watchlist-item:last-child {
    border-bottom: none;
}

.stock-info {
    min-width: 0;
}

.weekly-badge {
    background-color: var(--v-secondary-base);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    margin-left: 4px;
}

.search-results {
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
}

.cursor-pointer {
    cursor: pointer;
}

/* Dark theme adjustments */
.theme--dark .watchlist-item {
    border-bottom-color: rgba(255, 255, 255, 0.12);
}

.theme--dark .watchlist-item:hover {
    background-color: rgba(255, 255, 255, 0.04);
}

.theme--dark .search-results {
    border-color: rgba(255, 255, 255, 0.12);
}

/* Drag and Drop Styles */
.drag-handle {
    cursor: grab;
}

.drag-handle:active {
    cursor: grabbing;
}

.sortable-ghost {
    opacity: 0.5;
}

.sortable-chosen {
    background-color: rgba(0, 0, 0, 0.08);
}

.fade-move,
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.fade-leave-active {
    position: absolute;
}

/* Weekly Badge Styling */
.weekly-badge {
    border-radius: 4px;
    padding: 0px 4px;
    background-color: #F1F3F8 !important;
    font-weight: 500;
    font-size: 10px;
    line-height: 16px;
}

/* Holdings Badge Styling */
.table-hov-prd {
    transition: all 0.2s ease;
}

/* Match old app hover behavior */
.table-hide {
    opacity: 1;
    transition: opacity 0.2s ease;
}

.table-row:hover .table-hide {
    opacity: 0.5 !important;
}

/* Table Hover Styles - Hide buy/sell/options tabs by default, show on hover */
.table-row {
    position: relative;
    transition: background-color 0.2s ease;
}

.table-hov {
    display: none !important;
    align-items: center;
    z-index: 100 !important;
    pointer-events: auto !important;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
}

.watchlist-hover-options {
    display: none !important;
    align-items: center;
    z-index: 100 !important;
    pointer-events: auto !important;
}

/* Show hover options when table-row is hovered */
.table-row:hover .table-hov,
.table-row:hover .watchlist-hover-options,
.table-row .table-hov:hover,
.table-row .watchlist-hover-options:hover {
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
    z-index: 100 !important;
    opacity: 1 !important;
    visibility: visible !important;
}

/* Keep hover options visible when hovering over them */
.table-hov:hover,
.watchlist-hover-options:hover {
    display: inline-flex !important;
    opacity: 1 !important;
    visibility: visible !important;
}

.table-row:hover {
    background-color: #CFD9F2 !important;
}

.table-row:hover .table-hov-text {
    color: #0037B7 !important;
}

.table-row:hover .table-hov-prd {
    background-color: #fff !important;
}

/* Ensure hover options are visible on hover - override any conflicting styles */
.table-row:hover .pos-abs.table-hov,
.table-row:hover .pos-abs.watchlist-hover-options,
.table-row:hover .table-hov.watchlist-hover-options {
    display: inline-flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
}

/* Additional specificity for hover options - ensure they always show on hover */
div.table-row:hover div.table-hov,
div.table-row:hover div.watchlist-hover-options,
div.table-row:hover div.pos-abs.table-hov,
div.table-row:hover div.pos-abs.watchlist-hover-options {
    display: inline-flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
}

/* No scroll styling */
.no-scroll::-webkit-scrollbar {
    width: 0px;
    height: 0px;
}

/* Modern Watchlist Styles */
.modern-watchlist {
    padding: 0;
    background: transparent;
}

/* Search Header */
.search-header {
    /* padding: 16px; */
    background: #ffffff;
    border-radius: 12px;
    /* margin-bottom: 12px; */
}

.search-container {
    position: relative;
    display: flex;
    align-items: center;
    background: #F1F3F8;
    border-radius: 30px;
    padding: 4px 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-icon {
    color: #666666 !important;
    margin-right: 1px;
    font-size: 25px !important;
}

.search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent !important;
    padding: 5px 10px;
    color: #000;
    font-size: 14px;
    font-weight: 400;
    font-family: 'Tenon', 'Inter', sans-serif;
}

.search-input::placeholder {
    color: #666666;
}

.search-loader {
    position: absolute;
    right: 16px;
}

.search-clear-icon {
    position: absolute;
    right: 16px;
    margin-right: 0;
    font-size: 20px !important;
}

/* Watchlist Tabs */
.watchlist-tabs {
    display: flex;
    align-items: center;
    background: #ffffff;
    border-radius: 12px;
    padding: 8px;
    margin-bottom: 16px;
    gap: 8px;
}

.tabs-container {
    display: flex;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    white-space: nowrap;
}

.tabs-container::-webkit-scrollbar {
    display: none;
}

.tabs-scroll {
    display: inline-flex;
    gap: 8px;
    min-width: max-content;
    flex-shrink: 0;
}

.tab-button {
    background: #F1F3F8;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    color: #666666;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    font-family: 'Tenon', 'Inter', sans-serif;
    margin: 2px;
}

.tab-button:hover {
    background: #F1F3F8;
    color: #000;
}

.tab-button.active {
    background: black;
    color: white;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.action-btn {
    background: #F1F3F8;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #666666;
}

.action-btn:hover {
    background: #0037B7;
    color: white;
}

/* Stock List */
.stock-list {
    background: #ffffff;
    /* border-radius: 12px; */
    overflow: hidden;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 16px;
    color: #666666;
}

.loading-text {
    font-size: 14px;
    font-weight: 500;
}

.no-data-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    text-align: center;
}

.no-data-text {
    color: #666666;
    margin: 16px 0;
    font-size: 14px;
}

.add-stocks-btn {
    background: #0037B7;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.add-stocks-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

/* Stock Items */
.stocks-container {
    padding: 0;
    max-height: calc(100vh - 300px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE and Edge */
    scroll-behavior: auto;
    /* Change to auto for better performance during scroll */
    position: relative;
    /* Performance optimizations */
    will-change: scroll-position;
    contain: layout style paint;
    transform: translateZ(0);
    /* Force GPU acceleration */
    -webkit-overflow-scrolling: touch;
    /* Smooth on iOS */
    overscroll-behavior: contain;
    /* Prevent scroll chaining */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.stocks-container::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
}

.stock-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: background-color 0.15s ease;
    /* Only transition background for better performance */
    position: relative;
    contain: layout style paint;
    /* Optimize rendering */
    will-change: background-color;
    /* Optimize hover effect */
    scroll-behavior: smooth;
}

.stock-item:hover {
    background: #F1F3F8;
}

.stock-item:last-child {
    border-bottom: none;
}

.stock-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stock-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
}

.stock-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stock-symbol {
    color: #000;
    font-size: 16px;
    font-weight: 600;
    font-family: 'Tenon', 'Inter', sans-serif;
}

.stock-meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.exchange-badge {
    background: #F1F3F8;
    color: #000;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}

.exchange-nse {
    background: #e3f2fd;
    color: #1976d2;
}

.exchange-bse {
    background: #fff3e0;
    color: #f57c00;
}

.exchange-mcx {
    background: #f3e5f5;
    color: #7b1fa2;
}

.expiry-info {
    color: #666666;
    font-size: 12px;
}

.stock-right {
    text-align: right;
}

.price-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
}

.price-value {
    color: #000;
    font-size: 16px;
    font-weight: 600;
    font-family: 'Tenon', 'Inter', sans-serif;
}

.price-change {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
}

.change-value.positive,
.change-percent.positive {
    color: #35d05d;
}

.change-value.negative,
.change-percent.negative {
    color: #ff5252;
}

.change-value.neutral,
.change-percent.neutral {
    color: #666666;
}

.drag-handle {
    position: absolute;
    left: 4px;
    top: 50%;
    transform: translateY(-50%);
    cursor: grab;
    padding: 4px;
    border-radius: 4px;
    opacity: 0.5;
    transition: opacity 0.2s ease;
}

.drag-handle:hover {
    opacity: 1;
}

.holdings-badge {
    position: absolute;
    top: 8px;
    right: 8px;
}

/* Search Results Overlay */
.search-results-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 100px;
}

.search-results {
    background: #ffffff;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.search-result-item {
    position: relative;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    transition: background-color 0.2s ease;
}

.search-result-item:hover {
    background-color: #CFD9F2;
}

.search-result-item:last-child {
    border-bottom: none;
}

.search-result-hover {
    display: none !important;
}

.search-result-item:hover .search-result-hover {
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
}

.result-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.result-symbol {
    color: #000;
    font-size: 14px;
    font-weight: 600;
}

.result-exchange {
    color: #666666;
    font-size: 12px;
}

/* Dark theme adjustments */
.theme--dark .search-container {
    border-color: rgba(255, 255, 255, 0.1);
}

.theme--dark .stock-item {
    border-color: rgba(255, 255, 255, 0.05);
}

.theme--dark .search-result-item {
    border-color: rgba(255, 255, 255, 0.05);
}

/* Light theme adjustments */
.theme--light .search-container {
    border-color: rgba(0, 0, 0, 0.1);
}

.theme--light .stock-item {
    border-color: rgba(0, 0, 0, 0.05);
}

.theme--light .search-result-item {
    border-color: rgba(0, 0, 0, 0.05);
}

/* Responsive Design */
@media (max-width: 768px) {
    .search-header {
        padding: 12px;
    }

    .search-container {
        padding: 10px 12px;
    }

    .stock-item {
        padding: 12px;
    }

    .stock-symbol {
        font-size: 14px;
    }

    .price-value {
        font-size: 14px;
    }

    .watchlist-tabs {
        padding: 6px;
    }

    .tab-button {
        padding: 6px 12px;
        font-size: 13px;
    }
}

/* Pencil icon hover styles (like old app) */
.pdmwlist {
    display: none;
}

.pdmwlists:hover .pdmwlist {
    display: block;
}
</style>