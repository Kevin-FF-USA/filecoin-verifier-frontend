import React, { Component } from 'react';
import Logo from '../logo.svg';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import TiB from './svg/tib.svg';
import LessPiB from './svg/lesspib.svg';
import MorePiB from './svg/morepib.svg';
import Option from '../components/Option'
import Welcome from '../components/Welcome'
import TableVerifiers from '../components/TableVerifiers';

type States = {
  optionSelected: boolean[],
  tabs: string,
  url: number
}

type OptionType = {
  title: string,
  desc: string,
  imgSrc: string
}

type OptionsType = OptionType[]

const options: OptionsType = [
  {
    title: "Automatic Verification",
    desc: "Get a small amount of data cap automatically for development! Users will be required to have a github account older than 1 year to receive data cap.",
    imgSrc: TiB.toString()
  },
  {
    title: "Application Verification",
    desc: "Receive datacap to allocate to your users! Application developers will have to get verified and ensure that users will not abuse their data cap.",
    imgSrc: LessPiB.toString()
  }, {
    title: "General Verification",
    desc: "Receive a large amount of datacap for general storage requests such as personal, enterprise, institutional, or large scale archival purposes.",
    imgSrc: MorePiB.toString()
  }]

class Landing extends Component<{}, States> {

  child: any

  constructor(props: {}) {
    super(props);
    this.state = {
      optionSelected: [false, false, false],
      tabs: '0',
      url: 0,
    }
    this.child = React.createRef();
  }

  changeActive = (e: any) => {
    const newState = [false, false]
    this.state.optionSelected.forEach((_, index) => {
      index === Number(e.currentTarget.id) ?
        newState[index] = true :
        newState[index] = false
    })
    this.setState({
      optionSelected: newState,
      url: Number(e.currentTarget.id)
    })
  }

  showPublic = () => {
    this.setState({ tabs: "0" })
  }

  showPrivate = () => {
    this.setState({ tabs: "1" })
  }

  navigate = () => {
    if (this.state.url === 0 && this.state.tabs === '0') {
      window.open('https://verify.glif.io/', '_blank');
    } else if (this.state.tabs === '1') {
      this.child.current.contactVerifier();
    }
  }

  render() {
    return (
      <div className="landing">
        <div className="header">
          <div><img src={Logo} alt="Filecoin" /></div>
        </div>
        <div className="container">
          <Welcome />
          <div className="tabsholder">
            <div className={this.state.tabs === "0" ? "selected tab" : "tab"} onClick={() => { this.showPublic() }}>Public Request</div>
            <div className={this.state.tabs === "1" ? "selected tab" : "tab"} onClick={() => { this.showPrivate() }}>Private Requests</div>
          </div>
          {this.state.tabs === "0" ?
            <div className="options">
              {options.map((option: OptionType, index: number) => {
                return <Option
                  key={index}
                  id={index}
                  title={option.title}
                  desc={option.desc}
                  imgSrc={option.imgSrc}
                  active={this.state.optionSelected[index]}
                  onClick={this.changeActive.bind(this)}
                />
              })}
            </div>
            : <TableVerifiers ref={this.child}/>}
          <div className="started">
            <div className="doublebutton">
              <ButtonPrimary onClick={() => this.navigate()}>
                {this.state.tabs === "0" ? "Get Verified" : "Make Request"}
              </ButtonPrimary>
              <ButtonPrimary>Learn More</ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
