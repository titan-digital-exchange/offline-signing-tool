import React, { Component } from 'react';
var bitcoin = require('bitcoinjs-lib');

export default class Home extends Component {
  state = {
    wif: 'BuJRgDGLynQmN12yrS1kL4XGg8xzpySgGrWjdthsktgTZ9PfHnKF',
    sigHashesRaw: '["f7b43605ca334a74ba8bfdfa4099d0f995844d6fe1f24175907bbe343a1197bf"]',
    sigHashes: [],
    signatures: []
  }
  handleOnChange = (e) => {
    const { id, value } = e.target;
    this.setState({ [id]: value });
  }
  parseSigHashesRaw = async () => {
    const { sigHashesRaw } = this.state;
    const sigHashes = JSON.parse(sigHashesRaw) /* TODO safer implementation */;
    await this.setState({ sigHashes });
  }
  createSig = () => {
    const sign = (keyPair, sigHash) => keyPair.sign(Buffer.from(sigHash, 'hex')).toScriptSignature(bitcoin.Transaction.SIGHASH_ALL).toString('hex');
    const { sigHashes, wif } = this.state;
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
    const keyPair = bitcoin.ECPair.fromWIF(wif, network);
    const signatures = sigHashes.map(sigHash => sign(keyPair, sigHash));
    this.setState({ signatures });
  }
  handleSign = async () => {
    await this.parseSigHashesRaw();
    this.createSig();
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
    const { wif, sigHashesRaw, signatures } = this.state;
    let signaturesRaw;
    if (signatures.length > 0) {
      signaturesRaw = JSON.stringify(signatures);
    }
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <h2>Offline Signing Tool</h2>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <form>
              <div className="form-group">
                <label>WIF</label>
                <input className="form-control" value={wif} onChange={this.handleOnChange} type="string" id="wif" />
              </div>
              <div className="form-group">
                <label>Sig Hash (JSON)</label> {/* TODO better file format? */}
                <textarea className="form-control" spellCheck="false" value={sigHashesRaw} onChange={this.handleOnChange} id="sigHashesRaw" rows="3" placeholder="Sig hashes" required></textarea>
                {/* <input className="form-control" value={sigHash} onChange={this.handleOnChange} type="textarea" id="sigHash" /> */}
              </div>
              <button type="button" className="btn btn-success" onClick={this.handleSign}>
                Sign
              </button>
            </form>
            <div className="alert alert-success" style={{ marginTop: '1rem' }}>
              <h4 className="alert-heading">Signatures (JSON)</h4>
              {signaturesRaw && <div>
                <pre className="mb-0">{signaturesRaw}</pre>
                <button
                  style={{ marginTop: '1rem' }}
                  className="btn btn-info"
                  onClick={() => this.copyToClipboard(signaturesRaw)}
                >Copy</button>
              </div>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
