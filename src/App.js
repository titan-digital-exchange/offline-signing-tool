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
  copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }  
  render() {
    const { wif, sigHash, signature } = this.state;
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-xs mr-auto">
              <img className="img-fluid" style={{width: '4rem'}} src="/public/icons/Titan_Logo_BrandMark_DropShadow.png" alt=""/>
          </div>
        </div>
        <div className="container">
            <div className="row">
                <div className="card col-xs mx-auto" style={{padding: '3rem',minWidth: '30rem'}}>
                    <form>
                        <h2 className="text-center">Offline Signing Tool</h2>
                        <div className="form-group">
                            <label>WIF</label>
                            <input className="form-control" value={wif} onChange={this.handleOnChange} type="string" id="wif" />
                        </div>
                        <div className="form-group">
                            <label>Sig Hash</label>
                            <input className="form-control" value={sigHash} onChange={this.handleOnChange} type="string" id="sigHash" />
                        </div>
                        <div className="col-xs mx-auto text-center">
                            <div className="orangeButton" onClick={this.createSig}>
                                <div style={{margin:'auto'}}>
                                    Sign
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="alert alert-success" style={{ marginTop: '1rem' }}>
                        <h4 className="alert-heading text-center">Signature</h4>
                        {signature && <div>
                            <pre className="mb-0">{signature}</pre>
                            <div
                                style={{ marginTop: '1rem' }}
                                className="orangeButton"
                                onClick={() => this.copyToClipboard(signature)}
                            >
                                <div style={{margin:'auto'}}>
                                    Copy
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }
}
