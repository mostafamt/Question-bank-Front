import React, { useState } from "react";
import PanelHeader from "./components/PanelHeader";
import PanelTabs from "./components/PanelTabs";
import ActionButtonGrid from "./components/ActionButtonGrid";
import Bag from "../Bag/Bag";
import { READER_RIGHT_PANEL_TAB_CONFIG } from "./readerRightPanel.config";
import styles from "./readerRightPanel.module.scss";

/**
 * Right-hand panel of the Reader page: two tabs (each with its own grid of
 * action buttons) plus a persistent "My Bag" panel underneath.
 * See README.md for the design plan and open questions.
 */
const ReaderRightPanel = () => {
  const [activeTabId, setActiveTabId] = useState(
    READER_RIGHT_PANEL_TAB_CONFIG[0].id
  );
  const [activeAction, setActiveAction] = useState(null);

  const activeTab = READER_RIGHT_PANEL_TAB_CONFIG.find(
    (tab) => tab.id === activeTabId
  );

  const handleTabChange = (tabId) => {
    setActiveTabId(tabId);
    setActiveAction(null);
  };

  return (
    <div className={styles.panel}>
      <PanelHeader
        title={activeAction ? activeAction.label : activeTab.title}
        onBack={activeAction ? () => setActiveAction(null) : null}
      />
      <PanelTabs
        tabs={READER_RIGHT_PANEL_TAB_CONFIG}
        activeTabId={activeTabId}
        onChange={handleTabChange}
      />
      <div className={styles.body}>
        {activeAction ? (
          <div>{activeAction.label} content</div>
        ) : (
          <ActionButtonGrid
            actions={activeTab.actions}
            onSelectAction={setActiveAction}
          />
        )}
        <Bag />
      </div>
    </div>
  );
};

export default ReaderRightPanel;
