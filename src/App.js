import React, { Component } from 'react';
var bitcoin = require('bitcoinjs-lib');

export default class Home extends Component {
  state = {
    wif: 'BuJRgDGLynQmN12yrS1kL4XGg8xzpySgGrWjdthsktgTZ9PfHnKF',
    sigHash: 'f7b43605ca334a74ba8bfdfa4099d0f995844d6fe1f24175907bbe343a1197bf',
    signature: null
  }
  handleOnChange = (e) => {
    const { id, value } = e.target;
    this.setState({ [id]: value });
  }
  createSig = () => {
    const network = {
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bech32: 'bc',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4
      },
      pubKeyHash: 0x1b,
      scriptHash: 0x1f,
      wif: 0x49
    };
    const keyPair = bitcoin.ECPair.fromWIF(this.state.wif, network);
    console.log(this.state.sigHash);
    const signature = keyPair.sign(Buffer.from(this.state.sigHash, 'hex')).toScriptSignature(bitcoin.Transaction.SIGHASH_ALL).toString('hex');
    this.setState({signature});
  }

  render() {
    const { wif, sigHash, signature } = this.state;
    return (
      <div className="container" data-tid="container">
        <div className="row">
          <div className="col">
            <h2>Offline Signing Tool</h2>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <form>
              <label>WIF</label>
              <input value={wif} onChange={this.handleOnChange} type="string" id="wif" />

              <label>Sig Hash</label>
              <input value={sigHash} onChange={this.handleOnChange} type="string" id="sigHash" />

              <a onClick={() => this.createSig()} href="#">
                Submit
              </a>
            </form>
            {signature && 
              <p>
                {`Signature: ${signature}`}
              </p>
            }
            <h3>

            </h3>
          </div>
        </div>
      </div>
    );
  }
}
