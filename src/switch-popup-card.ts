import { LitElement, html, css, svg } from 'lit-element';
import { classMap } from "lit-html/directives/class-map";
import { closePopUp } from 'card-tools/src/popup';
import { computeStateDisplay, computeStateName } from 'custom-card-helpers';

class SwitchPopupCard extends LitElement {
  config: any;
  hass: any;
  shadowRoot: any;

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
        <div class="popup-inner" @click="${e => this._close(e)}">
      
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
        </div>
      </div>
    `;
  }
  
  updated() { }

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
      if(this.config.service) {
        var [domain, service] = this.config.service.split(".", 2);
        var service_data = Object.create(this.config.service_data);
      } else {
        var [domain, service] = this.config.buttons[value].service.split(".", 2);
        var service_data = Object.create(this.config.buttons[value].service_data);
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
          padding-top:5px;
        }
        .icon ha-icon {
            width:30px;
            height:30px;
        }
        .icon.on ha-icon {
            fill: #f7d959;
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
          margin-bottom: 5px;
          fill:#000;
          pointer-events: none;
        }
        .multi-switch li:hover {
          background-color: rgba(255, 255, 255, 0.5);
        }
        
    `;
  }
}
customElements.define("switch-popup-card", SwitchPopupCard);