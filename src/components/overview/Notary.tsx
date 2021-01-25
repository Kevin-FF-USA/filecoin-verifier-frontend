import React, { Component } from 'react';
import { Data } from '../../context/Data/Index';
import AddClientModal from '../../modals/AddClientModal';
import AddVerifierModal from '../../modals/AddVerifierModal';
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent, CheckBox, ButtonSecondary } from "slate-react-system";
import { datacapFilter, iBtoB } from "../../utils/Filters"
// @ts-ignore
import LoginGithub from 'react-login-github';
import { config } from '../../config'
import WarnModal from '../../modals/WarnModal';

type NotaryStates = {
    tabs: string
    selectedTransactions: any[]
    selectedClientRequests: any[]
}

type NotaryProps = {
    clients: any[]
}

export default class Notary extends Component<NotaryProps, NotaryStates> {
    public static contextType = Data

    state = {
        selectedTransactions: [] as any[],
        selectedClientRequests: [] as any[],
        tabs: '1'
    }

    componentDidMount() {
    }

    showVerifiedClients = async () => {
        this.setState({ tabs: "2" })
    }

    showClientRequests = async () => {
        this.setState({ tabs: "1" })
    }

    requestDatacap = () => {
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <AddClientModal />
            }
        })
    }

    verifyNewDatacap = () => {
        if (this.state.selectedClientRequests.length == 0 || this.state.selectedClientRequests.length > 1) {
            dispatchCustomEvent({
                name: "create-modal", detail: {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                    modal: <WarnModal message={'Please select only one address'} />
                }
            })
        } else {
            const selected = this.state.selectedClientRequests[0]
            this.setState({
                selectedClientRequests: []
            })
            dispatchCustomEvent({
                name: "create-modal", detail: {
                    id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                    modal: <AddClientModal newDatacap={true} clientRequest={this.context.clientRequests} selected={selected} />
                }
            })
        }
    }

    verifyClients = async () => {
        for (const request of this.context.clientRequests) {
            if (this.state.selectedClientRequests.includes(request.number)) {
                try {
                    let prepDatacap = '1'
                    let prepDatacapExt = 'B'
                    const dataext = config.datacapExt.slice().reverse()
                    for (const entry of dataext) {
                        if (request.data.datacap.endsWith(entry.name)) {
                            prepDatacapExt = entry.value
                            prepDatacap = request.data.datacap.substring(0, request.data.datacap.length - entry.name.length)
                            break
                        }
                    }
                    const datacap = parseFloat(prepDatacap)
                    const fulldatacapunconverted = BigInt(datacap * parseFloat(prepDatacapExt))
                    const fullDatacap = BigInt(iBtoB(fulldatacapunconverted.toString()))
                    let address = request.data.address
                    if (address.length < 12) {
                        address = await this.context.wallet.api.actorKey(address)
                    }
                    let messageID = await this.context.wallet.api.verifyClient(address, fullDatacap, this.context.wallet.walletIndex)
                    // github update
                    this.context.updateGithubVerified(request.number, messageID, address, fullDatacap)

                    // send notifications
                    this.context.wallet.dispatchNotification('Verify Client Message sent with ID: ' + messageID)
                    this.context.loadClientRequests()
                } catch (e) {
                    this.context.wallet.dispatchNotification('Verification failed: ' + e.message)
                    console.log(e.stack)
                }
            }
        }
    }

    selectRow = (transactionId: string) => {
        let selectedTxs = this.state.selectedTransactions
        if (selectedTxs.includes(transactionId)) {
            selectedTxs = selectedTxs.filter(item => item !== transactionId)
        } else {
            selectedTxs.push(transactionId)
        }
        this.setState({ selectedTransactions: selectedTxs })
    }

    selectClientRow = (number: string) => {
        let selectedTxs = this.state.selectedClientRequests
        if (selectedTxs.includes(number)) {
            selectedTxs = selectedTxs.filter(item => item !== number)
        } else {
            selectedTxs.push(number)
        }
        this.setState({ selectedClientRequests: selectedTxs })
    }

    proposeVerifier = async () => {
        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <AddVerifierModal />
            }
        })
    }

    timeout(delay: number) {
        return new Promise(res => setTimeout(res, delay));
    }

    public render() {
        return (
            <div className="main">
                <div className="tabsholder">
                    <div className="tabs">
                        <div className={this.state.tabs === "1" ? "selected" : ""} onClick={() => { this.showClientRequests() }}>Public Requests ({this.context.clientRequests.length})</div>
                        <div className={this.state.tabs === "2" ? "selected" : ""} onClick={() => { this.showVerifiedClients() }}>Verified clients ({this.props.clients.length})</div>
                    </div>
                    <div className="tabssadd">
                        <ButtonPrimary onClick={() => this.requestDatacap()}>Approve Private Request</ButtonPrimary>
                        {this.state.tabs === "1" ? <>
                            <ButtonPrimary onClick={() => this.verifyClients()}>Verify client</ButtonPrimary>
                            <ButtonPrimary onClick={() => this.verifyNewDatacap()}>Verify new datacap</ButtonPrimary>
                        </>
                            : null}
                    </div>
                </div>
                {this.state.tabs === "1" && this.context.github.githubLogged ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <td></td>
                                    <td>Client</td>
                                    <td>Address</td>
                                    <td>Datacap</td>
                                    <td>Audit trail</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.context.clientRequests.map((clientReq: any, index: any) =>
                                    <tr key={index}>
                                        <td><input type="checkbox" onChange={() => this.selectClientRow(clientReq.number)} checked={this.state.selectedClientRequests.includes(clientReq.number)} /></td>
                                        <td>{clientReq.data.name}</td>
                                        <td>{clientReq.data.address}</td>
                                        <td>{clientReq.data.datacap}</td>
                                        <td><a target="_blank" rel="noopener noreferrer" href={clientReq.url}>#{clientReq.number}</a></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {this.context.clientRequests.length === 0 ? <div className="nodata">No client requests yet</div> : null}
                        <div className="alignright">
                            <ButtonSecondary className="buttonsecondary" onClick={async () => {
                                await this.context.github.logoutGithub()
                                await this.context.refreshGithubData()
                            }}>
                                Logout GitHub
                            </ButtonSecondary>
                        </div>
                    </div>
                    : null}
                {this.state.tabs === "1" && !this.context.github.githubLogged ?
                    <div id="githublogin">
                        <LoginGithub
                            redirectUri={config.oauthUri}
                            clientId={config.githubApp}
                            scope="repo"
                            onSuccess={async (response: any) => {
                                await this.context.github.loginGithub(response.code)
                                await this.context.refreshGithubData()
                            }}
                            onFailure={(response: any) => {
                                console.log('failure', response)
                            }}
                        />
                    </div>
                    : null}
                {this.state.tabs === "2" ?
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <td>Name</td>
                                    <td>Address</td>
                                    <td>Address</td>
                                    <td>Datacap</td>
                                    <td>Audit trail</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.clients.map((transaction: any, index: any) =>
                                    <tr
                                        key={index}
                                    // onClick={()=>this.selectRow(transaction.id)}
                                    /*className={this.state.selectedTransactions.includes(transaction.id)?'selected':''}*/
                                    >

                                        <td>{this.context.clientsGithub[transaction.verified] ? this.context.clientsGithub[transaction.verified].data.name : null}</td>
                                        <td>{transaction.verified}</td>
                                        <td>{transaction.key}</td>
                                        <td>{datacapFilter(transaction.datacap)}</td>
                                        <td>{this.context.clientsGithub[transaction.verified] ? <a target="_blank" rel="noopener noreferrer" href={this.context.clientsGithub[transaction.verified].url}>#{this.context.clientsGithub[transaction.verified].number}</a> : null}</td>

                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {this.props.clients.length === 0 ? <div className="nodata">No verified clients yet</div> : null}
                    </div>
                    : null}
            </div>
        )
    }
}