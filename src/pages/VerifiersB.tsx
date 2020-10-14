import React, { Component } from 'react';
import Logo from '../logo.svg';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import Welcome from '../components/Welcome'
import TableVerifiers from '../components/TableVerifiers';
import TablePrivateVerifiers from '../components/TablePrivateVerifiers';


class VerifiersB extends Component<{}> {

  child: any

  constructor(props: {}) {
    super(props);
    this.child = React.createRef();
  }


  makeRequest = () => {
    this.child.current.contactVerifier();
  }

  render() {
    return (
      <div className="landing">
        <div className="header">
          <div><img src={Logo} alt="Filecoin" /></div>
        </div>
        <div className="container">
          <Welcome />
          <div className="tablebwrapper">
          <div className="automatictitle">Automatic verifiers</div>
          <TablePrivateVerifiers />
          <div className="generaltitle">General verifications</div>
          <TableVerifiers ref={this.child} />
          <div className="started">
            <div className="doublebutton">
              <ButtonPrimary onClick={() => this.makeRequest()}>
                Make Request
              </ButtonPrimary>
              <ButtonPrimary>Learn More</ButtonPrimary>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }
}

export default VerifiersB;
