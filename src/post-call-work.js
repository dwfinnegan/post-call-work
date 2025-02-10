import { Desktop } from '@wxcc-desktop/sdk';
import { Notifications, NotificationItemsContent } from "@uuip/unified-ui-platform-sdk";

const logger = Desktop.logger.createLogger('post-call-work');


class PostCallWork extends HTMLElement {

  constructor() {
    super();
    this.cadVariable = null;
    this.auxCodeId = null;
    this._auxCodeName = null;
    this._isAuxCodeValidated = false;
  }
  

  async pushAuxCodeErrorNotification(message) {

    function generateMessage(mode, message) {
      return {
        data: {
          type: Notifications.ItemMeta.Type.Error,
          mode: mode,
          title: "Post Call Work Config Error",
          data: new NotificationItemsContent.DataController({
            text: message,
            iconDetail: {
              iconName: 'icon-alert-active_16',
              color: 'red',
            }
          })
        },
      };
    };
   
    Desktop.actions.fireGeneralSilentNotification(generateMessage(Notifications.ItemMeta.Mode.Silent, message));
    Desktop.actions.fireGeneralAutoDismissNotification(generateMessage(Notifications.ItemMeta.Mode.AutoDismiss, message));
  }


  async initDesktop() {
    await Desktop.config.init({ widgetName: "post-call-work", widgetProvider: "dwfinnegan" });
  }


  async validateAuxCode() {
    if (this.auxCodeId) {
      const idleCodesFetchParams = { workType: 'IDLE_CODE', customFilter: `id=="${this.auxCodeId}"` };
      const idleCodes = await Desktop.agentConfigJsApi.fetchPaginatedAuxCodes(idleCodesFetchParams);

      if (idleCodes?.data.length > 0) {
        this._auxCodeName = idleCodes.data[0].name;
        this._isAuxCodeValidated = true;
        logger.info(`Verified Aux Code: ${this._auxCodeName} is properly configured`);
        logger.info(`Watching CAD variable ${this.cadVariable} for changes`)
      } else {
        logger.info(`Aux Code: ${this.auxCodeId} could not be found`);
        this.pushAuxCodeErrorNotification('The auxCodeId is either incorrect or not assigned to the agent.  Please contact your administrator');
      }

    } else {
      logger.error(`A property for auxCodeId was not set in the desktop layout`);
      this.pushAuxCodeErrorNotification('The auxCodeId is not set on the widget in the desktop layout.  Please contact your administrator');
    }
  }


  async checkCadVariable(msg) {
    if (msg?.data?.interaction?.callAssociatedDetails?.[this.cadVariable] === "true") {
      await Desktop.agentStateInfo.stateChange({ state: "Idle", auxCodeIdArray: this.auxCodeId });
      logger.info(`Found ${this.cadVariable}=true, setting state to ${this._auxCodeName}`);
    }
  }


  async connectedCallback() {
    await this.initDesktop();
    await this.validateAuxCode();

    if (this._isAuxCodeValidated) {
      Desktop.agentContact.addEventListener("eAgentContactEnded", msg => this.checkCadVariable(msg));
    }
  }


  disconnectedCallback() {
    logger.info(`Removing all event listeners...`);
    Desktop.agentContact.removeAllEventListeners();
  }

}

customElements.define('post-call-work', PostCallWork);
