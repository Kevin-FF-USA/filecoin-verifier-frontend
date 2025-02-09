import React from 'react'

export const Wallet = React.createContext({
    isLogged: false,
    isLoading: false,
    wallet: '',
    api: {},
    sign: async () => {},
    getAccounts: async () => {},
    walletIndex: 0,
    networkIndex: 0,
    accounts: [],
    accountsActive: {},
    activeAccount: '',
    importSeed: async (seedphrase: string) => {},
    selectNetwork: async (network: any) => {},
    selectAccount: async (account: any) => {},
    balance: 0,
    message: '',
    loadWallet: async (type: string) => {return false},
    dispatchNotification: (message: string) => {}
})