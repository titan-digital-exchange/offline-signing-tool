import React, { Component } from 'react';
var bitcoin = require('bitcoinjs-lib');

export default class Home extends Component {
  state = {
    wif: 'BuJRgDGLynQmN12yrS1kL4XGg8xzpySgGrWjdthsktgTZ9PfHnKF',
    sigHashesRaw: '["f7b43605ca334a74ba8bfdfa4099d0f995844d6fe1f24175907bbe343a1197bf"]',
    sigHashes: [],
    signatures: [],
    errorMessage: null
  }
  handleOnChange = (e) => {
    const { id, value } = e.target;
    this.setState({ [id]: value });
  }
  parseSigHashesRaw = async () => {
    const { sigHashesRaw } = this.state;
    try {
      const sigHashes = JSON.parse(sigHashesRaw) /* TODO safer implementation */;
      await this.setState({ sigHashes });
    } catch (err) {
      const errorMessage = err.message;
      this.setState({ errorMessage })
    }
  }
  createSig = () => {
    try {
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
    } catch (err) {
      const errorMessage = err.message;
      this.setState({ errorMessage })
    }
  }
  handleSign = async () => {
    this.setState({ errorMessage: null }) // reset error on new submit
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
  // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
  downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
  render() {
    const { wif, sigHashesRaw, signatures, errorMessage } = this.state;
    let signaturesRaw;
    if (signatures.length > 0) {
      signaturesRaw = JSON.stringify(signatures);
    }
    return (
        <div className="container-fluid">
            <div className="navbar">
                <div className="navbar-brand" style={{width: '10rem'}}>
                    <img className="img-fluid" src="/icons/titanLogoWhite.png" alt=""/>
                </div>
            </div>
            <div className="container">
                <div className="row">
                    <div className="card mx-auto w-auto text-center" style={{padding: '4rem', maxWidth: '50rem'}}>
                        <div className="col-xs mx-auto">
                            <form className="w-auto" style={{maxWidth: '35rem'}}>
                                <h2 className="text-center">Offline Signing Tool</h2>
                                <div className="form-group">
                                    <label>WIF</label>
                                    <input className="form-control" value={wif} onChange={this.handleOnChange} type="string" id="wif" />
                                </div>
                                <div className="form-group">
                                    <label>Sig Hash (JSON)</label> {/* TODO better file format? */}
                                    <input type="file" className="form-control-file"
                                           style={{ marginBottom: '.5rem' }}
                                           onChange={e => {
                                               const file = e.target.files[0];
                                               const fileReader = new FileReader();
                                               fileReader.addEventListener('load', () => this.setState({ sigHashesRaw: fileReader.result }));
                                               fileReader.readAsText(file);
                                           }}
                                    ></input>
                                    <textarea className="form-control" spellCheck="false" value={sigHashesRaw} onChange={this.handleOnChange} id="sigHashesRaw" rows="3" placeholder="Sig hashes" required></textarea>
                                    {/* <input className="form-control" value={sigHash} onChange={this.handleOnChange} type="textarea" id="sigHash" /> */}
                                </div>
                                {/*<div className="row text-center">*/}
                                <div className="orangeButton "
                                     onClick={this.handleSign}>
                                    <div style={{margin: 'auto'}}>
                                        Sign
                                    </div>
                                </div>
                                {/*</div>*/}
                            </form>
                            {errorMessage && <div className="alert alert-danger" style={{ marginTop: '1rem', maxWidth: '35rem' }}>
                                <h4 className="alert-heading">Error</h4>
                                {errorMessage}
                            </div>}
                            {signaturesRaw && <div className="alert alert-success" style={{ marginTop: '1rem', maxWidth: '35rem' }}>
                                <h4 className="alert-heading">Signatures (JSON)</h4>
                                {signaturesRaw && <div>
                                    <pre className="mb-0">{signaturesRaw}</pre>
                                    <div>
                                        <button
                                            type="button"
                                            style={{ marginTop: '1rem' }}
                                            className="btn btn-primary"
                                            onClick={() => this.downloadObjectAsJson(signatures /* not signaturesRaw */, 'signatures')}
                                        >Download File</button>
                                    </div>

                                    <div
                                        style={{ marginTop: '1rem' }}
                                        className="orangeButton"
                                        onClick={() => this.copyToClipboard(signaturesRaw)}>
                                        <div style={{margin: 'auto'}}>
                                            Copy
                                        </div>
                                    </div>
                                </div>}
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }
}
