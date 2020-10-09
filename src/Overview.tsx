import React, { Component } from 'react';
import { Wallet } from './context/Index';
import AddClientModal from './AddClientModal';
import AddVerifierModal from './AddVerifierModal';
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent, CheckBox } from "slate-react-system";
import { datacapFilter } from "./Filters"
// @ts-ignore
import LoginGithub from 'react-login-github';
import { config } from './config'

type OverviewStates = {
    tabs: string
    pendingverifiers: any[]
    clientsamount: string
    clients: any[]
    approveLoading: boolean
    selectedTransactions: any[]
    selectedClientRequests: any[]
}

export default class Overview extends Component<{}, OverviewStates> {
    public static contextType = Wallet

    state = {
        selectedTransactions: [] as any[],
        selectedClientRequests: [] as any[],
        approveLoading: false,
        tabs: '1',
        pendingverifiers: [] as any[],
        clientsamount: '',
        clients: [] as any[],
    }

    componentDidMount() {
        this.loadData()
    }

    showPending = async () => {
        this.setState({tabs: "1"})
    }

    showApproved = async () => {
        this.setState({tabs: "2"})
    }

    showVerifiedClients = async () => {
        this.setState({tabs: "2"})
    }

    showClientRequests = async () => {
        this.setState({tabs: "1"})
    }

    requestDatacap = () => {
        dispatchCustomEvent({ name: "create-modal", detail: {
            id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
            modal: <AddClientModal/>
        }})
    }

    verifyClients = async() => {
        for(const request of this.context.clientRequests){
            if(this.state.selectedClientRequests.includes(request.number)){
                try{
                    let prepDatacap = '1'
                    let prepDatacapExt = 'B'
                    const dataext = config.datacapExt.reverse()
                    for(const entry of dataext){
                        if(request.data.datacap.endsWith(entry.name)){
                            prepDatacapExt = entry.value
                            prepDatacap = request.data.datacap.substring(0, request.data.datacap.length-entry.name.length)
                            break
                        }
                    }
                    const datacap = parseFloat(prepDatacap)
                    const fullDatacap = BigInt(datacap * parseFloat(prepDatacapExt))
                    let address = request.data.address
                    if(address.length < 12){
                        address = await this.context.api.actorKey(address)
                    }
                    let messageID = await this.context.api.verifyClient(address, fullDatacap, this.context.walletIndex)
                    // github update
                    await this.context.githubOcto.issues.removeAllLabels({
                        owner: 'keyko-io',
                        repo: 'filecoin-clients-onboarding',
                        number: request.number,
                    })
                    await this.context.githubOcto.issues.addLabels({
                        owner: 'keyko-io',
                        repo: 'filecoin-clients-onboarding',
                        number: request.number,
                        labels: 'state:Granted',
                    })
                    // send notifications
                    this.context.dispatchNotification('Verify Client Message sent with ID: ' + messageID)
                } catch (e) {
                    this.context.dispatchNotification('Verification failed: ' + e.message)
                    console.log(e.stack)
                }
            }
        }
    }

    selectRow = (transactionId: string) => {
        let selectedTxs = this.state.selectedTransactions
        if(selectedTxs.includes(transactionId)){
            selectedTxs = selectedTxs.filter(item => item !== transactionId)
        } else {
            selectedTxs.push(transactionId)
        }
        this.setState({selectedTransactions:selectedTxs})
    }

    selectClientRow = (number: string) => {
        let selectedTxs = this.state.selectedClientRequests
        if(selectedTxs.includes(number)){
            selectedTxs = selectedTxs.filter(item => item !== number)
        } else {
            selectedTxs.push(number)
        }
        this.setState({selectedClientRequests:selectedTxs})
    }

    proposeVerifier = async () => {
        dispatchCustomEvent({ name: "create-modal", detail: {
            id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
            modal: <AddVerifierModal/>
        }})
    }

    handleSubmitApprove = async () => {
        this.setState({ approveLoading: true })
        try {
            for(let tx of this.state.pendingverifiers){
                if(this.state.selectedTransactions.includes(tx.id)){
                    const datacap = BigInt(tx.datacap)
                    await this.context.api.approveVerifier(tx.verifier, datacap, tx.signer, tx.id, this.context.walletIndex);
                }
            }
            this.setState({ selectedTransactions:[], approveLoading: false })
            this.context.dispatchNotification('Transactions confirmed')
        } catch (e) {
            this.setState({ approveLoading: false })
            this.context.dispatchNotification('Approval failed: ' + e.message)
            console.log('error', e.stack)
        }
    }

    loadData = async () => {
        await this.context.loadVerified() // loaded into context
        const clients = await this.context.api.listVerifiedClients()
        // pending verififers
        let pendingTxs = await this.context.api.pendingRootTransactions()
        let pendingverifiers: any[] = []
        for(let txs in pendingTxs){
            pendingverifiers.push({
                id: txs,
                type: pendingTxs[txs].parsed.params.cap.toString() === '0' ? 'Revoke' : 'Add',
                verifier: pendingTxs[txs].parsed.params.verifier,
                datacap: pendingTxs[txs].parsed.params.cap.toString(),
                signer: pendingTxs[txs].signers[0]
            })
        }
        let clientsamount = 0
        for(const txs of clients){
            clientsamount = clientsamount + Number(txs.datacap)
        }
        this.setState({
            clients,
            pendingverifiers,
            clientsamount: clientsamount.toString()
        })
    }

    public render(){
        return (
            <div className="page">
                <div className="info">
                    <div className="textinfo">
                        <div className="textinfotext">
                            <h2>What is Filecoin Pro Registry?</h2>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                        </div>
                        <div className="textinfodata">
                            <div className="textinfodatablock">
                                <div className="data">{datacapFilter(this.state.clientsamount)}</div>
                                <div className="text">Datacap Granted</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">{this.state.pendingverifiers.length}</div>
                                <div className="text">Pending verifiers</div>
                            </div>
                            <div className="textinfodatablock">
                                <div className="data">{this.context.verified.length}</div>
                                <div className="text">Approved Verifiers</div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.context.viewroot ?
                    <div className="main">
                        <div className="tabsholder">
                            <div className="tabs">
                                <div className={this.state.tabs === "1" ? "selected" : ""} onClick={()=>{this.showPending()}}>Pending verifiers ({this.state.pendingverifiers.length})</div>
                                <div className={this.state.tabs === "2" ? "selected" : ""} onClick={()=>{this.showApproved()}}>Accepted Verifiers ({this.context.verified.length})</div>
                            </div>
                            <div className="tabssadd">
                                {this.state.tabs === "2" ? <ButtonPrimary onClick={()=>this.proposeVerifier()}>Propose verifier</ButtonPrimary> : null}
                                {this.state.tabs === "1" ? <ButtonPrimary onClick={()=>this.handleSubmitApprove()}>Accept verifiers</ButtonPrimary> : null}
                            </div>
                        </div>
                        { this.state.tabs === "2" ?
                            <div>

                                <table>
                                    <thead>
                                        <tr>
                                            <td>Verifier</td>
                                            <td>Datacap</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.context.verified.map((transaction:any, index:any) => 
                                            <tr key={index}>
                                                <td>{transaction.verifier}</td>
                                                <td>{datacapFilter(transaction.datacap)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {this.context.verified.length === 0 ? <div className="nodata">No verifiers yet</div> : null}
                            </div>:null
                        }
                        { this.state.tabs === "1" ?
                            <div>
                                
                                <table>
                                    <thead>
                                        <tr>
                                            <td>Type</td>
                                            <td>Verifier</td>
                                            <td>Datacap</td>
                                            <td>Proposed By</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.pendingverifiers.map((transaction:any, index:any) => 
                                            <tr
                                                key={index}
                                                onClick={()=>this.selectRow(transaction.id)}
                                                className={this.state.selectedTransactions.includes(transaction.id)?'selected':''}
                                            >
                                                <td>{transaction.type}</td>
                                                <td>{transaction.verifier}</td>
                                                <td>{datacapFilter(transaction.datacap)}</td>
                                                <td>{transaction.signer}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {this.state.pendingverifiers.length === 0 ? <div className="nodata">No pending verifiers yet</div> : null}
                            </div>:null
                        }
                    </div>
                :
                    <div className="main">
                        <div className="tabsholder">
                            <div className="tabs">
                                <div className={this.state.tabs === "1" ? "selected" : ""} onClick={()=>{this.showClientRequests()}}>Client Requests ({this.context.clientRequests.length})</div>
                                <div className={this.state.tabs === "2" ? "selected" : ""} onClick={()=>{this.showVerifiedClients()}}>Verified clients ({this.state.clients.length})</div>
                            </div>
                            <div className="tabssadd">
                                <ButtonPrimary onClick={()=>this.requestDatacap()}>Request datacap</ButtonPrimary>
                                <ButtonPrimary onClick={()=>this.verifyClients()}>Verify client</ButtonPrimary>
                            </div>
                        </div>
                        { this.state.tabs === "1" && this.context.githubLogged ?
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
                                        {this.context.clientRequests.map((clientReq:any, index:any) => 
                                            <tr key={index}>
                                                <td><input type="checkbox" onChange={()=>this.selectClientRow(clientReq.number)} checked={this.state.selectedClientRequests.includes(clientReq.number)}/></td>
                                                <td>{clientReq.data.name}</td>
                                                <td>{clientReq.data.address}</td>
                                                <td>{clientReq.data.datacap}</td>
                                                <td><a target="_blank" rel="noopener noreferrer" href={clientReq.url}>#{clientReq.number}</a></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {this.context.clientRequests.length === 0 ? <div className="nodata">No client requests yet</div> : null}
                            </div>
                        : null }
                        { this.state.tabs === "1" && !this.context.githubLogged ?
                            <div id="githublogin">
                                <LoginGithub
                                    clientId="8e922e2845a6083ab65c"
                                    scope="repo"
                                    onSuccess={(response:any)=>{
                                        this.context.loginGithub(response.code)
                                    }}
                                    onFailure={(response:any)=>{
                                        console.log('failure', response)
                                    }}
                                />
                            </div>
                        : null }
                        { this.state.tabs === "2" ?
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <td>Name</td>
                                            <td>Address</td>
                                            <td>Datacap</td>
                                            <td>Audit trail</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.clients.map((transaction:any, index:any) => 
                                            <tr
                                                key={index}
                                                // onClick={()=>this.selectRow(transaction.id)}
                                                /*className={this.state.selectedTransactions.includes(transaction.id)?'selected':''}*/
                                            >

                                                <td>{this.context.clientsGithub[transaction.verified] ? this.context.clientsGithub[transaction.verified].data.name : null}</td>
                                                <td>{transaction.verified}</td>
                                                <td>{datacapFilter(transaction.datacap)}</td>
                                                <td>{this.context.clientsGithub[transaction.verified] ? <a target="_blank" rel="noopener noreferrer" href={this.context.clientsGithub[transaction.verified].url}>#{this.context.clientsGithub[transaction.verified].number}</a>:null}</td>

                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {this.state.clients.length === 0 ? <div className="nodata">No verified clients yet</div> : null}
                            </div>
                        : null }
                    </div>
                }
            </div>
        )
    }
}
