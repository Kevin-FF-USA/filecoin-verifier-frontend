import React, { Component } from 'react';
// @ts-ignore
import { Table, CheckBox, dispatchCustomEvent, ButtonPrimary } from "slate-react-system";
import MakeRequestModal from '../MakeRequestModal';

export default class TablePrivateVerifiers extends Component {

    columns = [
        { key: "name", name: "Notary Name", type: "FILE_LINK", width: "98px" },
        { key: "use_case", name: "Use Case" },
        { key: "location", name: "Location" },
        { key: "website", name: "website" },
        { key: "total_datacap", name: "Datacap" },
        { key: "private_request", name: "Available for private request" }
    ]

    state = {
        verifiers: [],
        selectedVerifier: 0,
        checks: []
    }

    componentDidMount() {
        this.loadData()
    }

    loadData = async () => {
        await this.getList()
        let initialChecks = [] as any[]
        this.state.verifiers.forEach((_) => {
            initialChecks.push(false)
        })
        this.setState({ checks: initialChecks })
    }

    getList = async () => {
        const verifiers = require('../data/private-verifiers.json').notarys;
        this.setState({ verifiers })
    }

    updateChecks = (e: any) => {
        let checks = [] as any[]
        this.state.checks.forEach((_, i) => {
            checks.push(Number(e.target.name) === i ?
                e.target.value :
                false)
        })
        this.setState({ checks: checks })
        this.setState({ selectedVerifier: Number(e.target.name) })
    }

    contactVerifier = async () => {
        window.open('https://verify.glif.io/', '_blank');
    }

    public render() {
        return (
            <div className="verifiersB">
                <div className="tableverifiers">
                    <div className="checks">
                        {this.state.verifiers.map((_, i) => {
                            return (<CheckBox
                                name={i}
                                key={i}
                                value={this.state.checks[i]}
                                onChange={this.updateChecks}
                            />)
                        })}
                    </div>
                    <div className="data">
                        <Table
                            data={{
                                columns: this.columns,
                                rows: this.state.verifiers,
                            }}
                            name="verifiers"
                        />
                        <ButtonPrimary onClick={() => this.contactVerifier()}>
                            Make Request
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        )
    }
}