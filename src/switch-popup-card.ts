import { LitElement, html, css, svg } from 'lit-element';
import { closePopUp } from 'card-tools/src/popup';
import { provideHass } from "card-tools/src/hass";
import { createCard } from "card-tools/src/lovelace-element.js";

class SwitchPopupCard extends LitElement {
  config: any;
  hass: any;
  shadowRoot: any;
  settings = false;
  settingsCustomCard = false;
  settingsPosition = "bottom";

  static get properties() {
    return {
      hass: {},
      config: {},
      active: {}
    };
  }
  
  constructor() {
    super();
  }
  
  render() {



    var buttons = this.config.buttons;
    var entities = this.config.entities;
    var fullscreen = "fullscreen" in this.config ? this.config.fullscreen : true;
    var switchWidth = this.config.switchWidth ? this.config.switchWidth : "180px";
    var icon = this.config.icon ? this.config.icon: '';

    this.settings = "settings" in this.config ? true : false;
    this.settingsCustomCard = "settingsCard" in this.config ? true : false;
    this.settingsPosition = "settingsPosition" in this.config ? this.config.settingsPosition : "bottom";
    if(this.settingsCustomCard && this.config.settingsCard.cardOptions) {
      if(this.config.settingsCard.cardOptions.entity && this.config.settingsCard.cardOptions.entity == 'this') {
        this.config.settingsCard.cardOptions.entity = entities[0];
      } else if(this.config.settingsCard.cardOptions.entity_id && this.config.settingsCard.cardOptions.entity_id == 'this') {
        this.config.settingsCard.cardOptions.entity_id = entities[0];
      } else if(this.config.settingsCard.cardOptions.entities) {
        for(let key in this.config.settingsCard.cardOptions.entities) {
          if(this.config.settingsCard.cardOptions.entities[key] == 'this') {
            this.config.settingsCard.cardOptions.entities[key] = entities[0];
          }
        }
      }
    }
    
    //Check what state is active
    var activeState;
    for(let i = 0; i < buttons.length;i++) {
      let active = true;
      
      for(let j in entities) {
          let state = this.hass.states[entities[j]];
          let value = buttons[i].value;
          if(this._getValue(state) != value) {
            active = false;
          }
      }

      if(active) {
        activeState = i;
      }
    }
    
    var count = -1;
    return html`
      <div class="${fullscreen === true ? 'popup-wrapper':''}">
        <div id="popup" class="popup-inner" @click="${e => this._close(e)}">
      
          <div class="icon on${fullscreen === true ? ' fullscreen':''}">
            <ha-icon icon="${buttons[activeState] ? buttons[activeState].icon: icon}"></ha-icon>
          </div>

          <h4>${buttons[activeState] ? buttons[activeState].name : this.config.noActiveState ? this.config.noActiveState : ''}</h4>

          <ul class="multi-switch" style="--switch-width:${switchWidth}">
            ${buttons.map(button => {
              count++;
              return html`<li @click="${e => this._switch(e)}" data-value="${count}" class="${count == activeState ? 'active' : ''}"><ha-icon icon="${button.icon}"></ha-icon>${button.name}</li>`
            })}
          </ul>

          ${this.settings ? html`<button class="settings-btn ${this.settingsPosition}${fullscreen === true ? ' fullscreen':''}" @click="${() => this._openSettings()}">${this.config.settings.openButton ? this.config.settings.openButton:'Settings'}</button>`:html``}
        </div>
        ${this.settings ? html`
          <div id="settings" class="settings-inner" @click="${e => this._close(e)}">
            ${this.settingsCustomCard ? html`
              <div class="custom-card" data-card="${this.config.settingsCard.type}" data-options="${JSON.stringify(this.config.settingsCard.cardOptions)}" data-style="${this.config.settingsCard.cardStyle ? this.config.settingsCard.cardStyle : ''}">
              </div>
            `:html`
                <p style="color:#F00;">Set settingsCustomCard to render a lovelace card here!</p>
            `}
            <button class="settings-btn ${this.settingsPosition}${fullscreen === true ? ' fullscreen':''}" @click="${() => this._closeSettings()}">${this.config.settings.closeButton ? this.config.settings.closeButton:'Close'}</button>
          </div>
        `:html``}
      </div>
    `;
  }
  
  updated() { }

  firstUpdated() {
    if(this.settings && !this.settingsCustomCard) {
    const mic = this.shadowRoot.querySelector("more-info-controls").shadowRoot;
    mic.removeChild(mic.querySelector("app-toolbar"));
    } else if(this.settings && this.settingsCustomCard) {
      this.shadowRoot.querySelectorAll(".custom-card").forEach(customCard => {
        var card = {
          type: customCard.dataset.card
        };
        card = Object.assign({}, card, JSON.parse(customCard.dataset.options));
        const cardElement = createCard(card);
        customCard.appendChild(cardElement);
        provideHass(cardElement);
        let style = "";
        if(customCard.dataset.style) {
          style = customCard.dataset.style;
        }
        if(style!= "") {
          let itterations = 0;
          let interval = setInterval(function() {
              if(cardElement && cardElement.shadowRoot) {
                  window.clearInterval(interval);
                  var styleElement = document.createElement('style');
                  styleElement.innerHTML = style;
                  cardElement.shadowRoot.appendChild(styleElement);
              } else if(++itterations === 10) {
                  window.clearInterval(interval);
              }
          }, 100);
        }
      });
    }
  }

  _openSettings() {
    this.shadowRoot.getElementById('popup').classList.add("off");
    this.shadowRoot.getElementById('settings').classList.add("on");
  }
  _closeSettings() {
    this.shadowRoot.getElementById('settings').classList.remove("on");
    this.shadowRoot.getElementById('popup').classList.remove("off");
  }

  _getValue(stateObj) {
    var state = stateObj;
    var path = this.config.entity_value_path.split('.');
    for(var pathItem of path) {
      if(state[pathItem]) {
        state = state[pathItem];
      } else {
        state = null;
      }
    }
    return state;
  }


  _switch(e) {
    if(e.target.dataset && e.target.dataset.value) {
      var value = e.target.dataset.value;
      var service_data: any;
      if(this.config.service) {
        var [domain, service] = this.config.service.split(".", 2);
        service_data =  Object.assign({}, this.config.service_data);
      } else {
        var [domain, service] = this.config.buttons[value].service.split(".", 2);
        service_data = Object.assign({}, this.config.buttons[value].service_data);
      }

      for(var entity of this.config.entities) {
        for(var key in service_data) {
          if(service_data[key] == 'this') {
            service_data[key] = entity;
          } else if(service_data[key] == 'value') {
            service_data[key] = this.config.buttons[value].value;
          }
        }
        this.hass.callService(domain, service, service_data);
      }
    }
  }

  _close(event) {
      if(event && event.target.className === 'popup-inner') {
          closePopUp();
      }
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error("You need to define entities");
    }
    if (!config.buttons) {
      throw new Error("You need to define buttons");
    }
    this.config = config;
  }

  getCardSize() {
    return 1;
  }
  
  static get styles() {
    return css`
        :host {

        }
        .popup-wrapper {
          margin-top:64px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        .popup-inner {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .popup-inner.off {
          display:none;
        }
        .fullscreen {
          margin-top:-64px;
        }
        .icon {
          text-align:center;
          display:block;
          height: 40px;
          width: 40px;
          color: rgba(255,255,255,0.3);
          font-size: 30px;
          --mdc-icon-size: 30px;
          padding-top:5px;
        }
        .icon ha-icon {
            width:30px;
            height:30px;
        }
        .icon.on ha-icon {
            color: #f7d959;
        }
        h4 {
            color: #FFF;
            display: block;
            font-weight: 300;
            margin-bottom: 30px;
            text-align: center;
            font-size:20px;
            margin-top:0;
            text-transform: capitalize;
        }

        .multi-switch {
          width: var(--switch-width);
          background-color: rgba(255, 255, 255, 0.4);
          list-style: none;
          margin: 0;
          padding: 0;
          color: #000;
          font-weight: 400;
          border-radius: 12px;
          overflow: hidden;
        }
        .multi-switch li {
          padding: 25px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          font-weight:500;
          align-items: center;
          justify-content: center;
          display: flex;
          flex-direction: column;
          text-transform: capitalize;
        }
        .multi-switch li.active {
          background-color: #FFF;
        }
        .multi-switch li.active:hover {
          background-color: #FFF;
        }
        .multi-switch li:last-child {
          border-bottom: 0;
        }
        .multi-switch li ha-icon {
          display: block;
          font-size: 25px;
          --mdc-icon-size: 25px;
          margin-bottom: 5px;
          color:#000;
          pointer-events: none;
        }
        .multi-switch li:hover {
          background-color: rgba(255, 255, 255, 0.5);
        }

        #settings {
          display:none;
        }
        .settings-inner {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        #settings.on {
          display:flex;
        }
        .settings-btn {
          position:absolute;
          right:30px;
          background-color: #7f8082;
          color: #FFF;
          border: 0;
          padding: 5px 20px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
        }
        .settings-btn.bottom {
          bottom:15px;
        }
        .settings-btn.bottom.fullscreen {
          margin:0;
        }
        .settings-btn.top {
          top: 25px;
        }
        
    `;
  }
}
customElements.define("switch-popup-card", SwitchPopupCard);