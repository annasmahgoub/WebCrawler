import React, { useState } from "react";
import AmigosBar from "../components/AmigosBar";
import WelcomeCard from "../components/welcomeCard";


export const HomePage = () => {
    const [showAddButton, setShowAddButton] = useState(true);

    // Callback functions for better clarity
    const hideAddButton = () => {
        setShowAddButton(false);
    }

    const showButton = () => {
        setShowAddButton(true);
    }

    return (
        <>
        <AmigosBar />
        <div style={{ 
        padding: "0px", 
        textAlign: "center",
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh"
      }}>
        <WelcomeCard></WelcomeCard>
        <div>
          <p>&copy; Omar Abdelhadi, Annas Mahgoub, Waddah Almoufti</p>
        </div>
        
    </div>
    </>
  )
}