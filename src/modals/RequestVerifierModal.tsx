import React, { Component } from 'react';
import { Wallet } from '../context/Wallet/Index'
import { config } from '../config'
// @ts-ignore
import { dispatchCustomEvent, Input, ButtonPrimary, SelectMenu, LoaderSpinner } from "slate-react-system";

type States = {
    address: string
    datacap: string
    organization: string
    publicprofile: string
    contact: string
    comments: string
    datacapExt: string
    submitLoading: boolean
};

class RequestVerifierModal extends Component<{}, States> {
    public static contextType = Wallet

    constructor(props: {}) {
        super(props);
        this.state = {
            address: '',
            datacap: '1',
            organization: '',
            publicprofile: '',
            contact: '',
            comments: '',
            datacapExt: 'TiB',
            submitLoading: false
        }
    }

    componentDidMount () {

    }

    handleSubmit = async (e:any) => {
        e.preventDefault()
        this.setState({ submitLoading: true })
        this.context.createVerifierRequest({
            address: this.state.address,
            datacap: this.state.datacap + this.state.datacapExt,
            organization: this.state.organization,
            publicprofile: this.state.publicprofile,
            contact: this.state.contact,
            comments: this.state.comments
        })
        dispatchCustomEvent({ name: "delete-modal", detail: {} })
        this.setState({ submitLoading: false })
    }

    handleChange = (e:any) => {
        this.setState({ [e.target.name]: e.target.value } as any)
    }

  render() {
    return (
      <div className="addmodal">
        <form>
            <div className="title">Making Notary Request</div>
            <div className="twopanel">

                <div>
                    <div className="inputholder">
                        <Input
                            description="Organization"
                            name="organization"
                            value={this.state.organization}
                            placeholder="Name of organization"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="inputholder">
                        <Input
                            description="Public Profile of Organization"
                            name="publicprofile"
                            value={this.state.publicprofile}
                            placeholder="XXXXXXXXXXX"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="inputholder">
                        <Input
                            description="Contact Information"
                            name="contact"
                            value={this.state.contact}
                            placeholder="Contact of Proposer"
                            onChange={this.handleChange}
                        />
                    </div>
                </div>


                <div>
                    <div className="inputholder">
                        <Input
                            description="Address"
                            name="address"
                            value={this.state.address}
                            placeholder="XXXXXXXXXXX"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="datacapholder">
                        <div className="datacap">
                            <Input
                                description="Datacap Request"
                                name="datacap"
                                value={this.state.datacap}
                                placeholder="1000000000000"
                                onChange={this.handleChange}
                            />
                        </div>
                        <div className="datacapext">
                            <SelectMenu
                                name="datacapExt"
                                value={this.state.datacapExt}
                                onChange={this.handleChange}
                                options={config.datacapExtName}
                            />
                        </div>
                    </div>
                    <div className="inputholder">
                        <Input
                            description="Comments"
                            name="comments"
                            value={this.state.comments}
                            placeholder="Additional comments"
                            onChange={this.handleChange}
                        />
                    </div>
                </div>

            </div>
            <div className="centerbutton">
                <ButtonPrimary onClick={this.handleSubmit}>{this.state.submitLoading ? <LoaderSpinner /> : 'Send Request'}</ButtonPrimary>
            </div>
        </form>
      </div>
    )
  }
}

export default RequestVerifierModal;