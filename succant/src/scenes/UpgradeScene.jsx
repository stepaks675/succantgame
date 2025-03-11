import Phaser from 'phaser';

export default class UpgradeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UpgradeScene' });
    this.playerStats = null;
    this.skillPoints = 0;
    this.onContinue = null;
    this.activeTab = 'upgrades';
    this.tooltipText = null;
  }
  
  init(data) {
    this.playerStats = data.playerStats;
    this.skillPoints = data.skillPoints;
    this.onContinue = data.onContinue;
    
    if (!this.playerStats.specials) {
      this.playerStats.specials = {
        pierce: 0,
        claw: 0,
        ice: 0,
        spiky: 0,
        turret: 0
      };
    }
    
    if (!this.playerStats.lastSpecialUpgradeLevel) {
      this.playerStats.lastSpecialUpgradeLevel = 0;
    }
  }
  
  create() {
    const bg = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.8);
    bg.setOrigin(0);
    
    this.add.text(400, 50, 'UPGRADE MENU', { 
      fontSize: '32px', 
      fontStyle: 'bold',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    this.skillPointsText = this.add.text(400, 100, `Available Skill Points: ${this.skillPoints}`, { 
      fontSize: '24px',
      fill: '#ffff00'
    }).setOrigin(0.5);
    
    this.createTabs();
    
    const continueButton = this.add.text(400, 550, 'Return to Game', { 
      fontSize: '24px',
      fill: '#00ff00',
      backgroundColor: '#333333',
      padding: { left: 15, right: 15, top: 8, bottom: 8 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => continueButton.setStyle({ fill: '#ffffff' }))
      .on('pointerout', () => continueButton.setStyle({ fill: '#00ff00' }))
      .on('pointerdown', () => {
        this.scene.stop();
        if (this.onContinue) {
          this.onContinue(this.playerStats);
        }
      });
      
    this.tooltipText = this.add.text(400, 500, '', { 
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
      wordWrap: { width: 400 }
    }).setOrigin(0.5).setAlpha(0);
  }
  
  createTabs() {
    this.upgradesContainer = this.add.container(0, 0);
    this.specialsContainer = this.add.container(0, 0);
    
    this.specialsContainer.setVisible(false);
    
    const tabUpgrades = this.add.text(300, 150, 'Upgrades', { 
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#444444',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.upgradesContainer.setVisible(true);
        this.specialsContainer.setVisible(false);
        tabUpgrades.setStyle({ backgroundColor: '#444444' });
        tabSpecials.setStyle({ backgroundColor: '#222222' });
        this.activeTab = 'upgrades';
        this.hideTooltip();
      });
    
    const tabSpecials = this.add.text(500, 150, 'Special Abilities', { 
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#222222',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.upgradesContainer.setVisible(false);
        this.specialsContainer.setVisible(true);
        tabUpgrades.setStyle({ backgroundColor: '#222222' });
        tabSpecials.setStyle({ backgroundColor: '#444444' });
        this.activeTab = 'specials';
        this.hideTooltip();
      });
    
    this.createUpgradeButtons();
    this.createSpecialButtons();
  }
  
  createUpgradeButtons() {
    const upgrades = [
      {
        name: 'Health',
        description: '+25 to maximum health',
        stat: 'maxHealth',
        amount: 25,
        currentValue: this.playerStats.maxHealth,
        y: 200
      },
      {
        name: 'Regeneration',
        description: '+1 to health regeneration',
        stat: 'healthRegen',
        amount: 1,
        currentValue: this.playerStats.healthRegen,
        y: 260
      },
      {
        name: 'Damage',
        description: '+4 to damage',
        stat: 'damage',
        amount: 4,
        currentValue: this.playerStats.damage,
        y: 320
      },
      {
        name: 'Speed',
        description: '+20 to movement speed',
        stat: 'speed',
        amount: 20,
        currentValue: this.playerStats.speed,
        y: 380
      },
      {
        name: 'Attack Speed',
        description: '+0.2 to attack speed',
        stat: 'attackSpeed',
        amount: 0.2,
        currentValue: this.playerStats.attackSpeed,
        y: 440
      }
    ];
    
    upgrades.forEach(upgrade => {
      const statText = this.add.text(200, upgrade.y, `${upgrade.name}: ${upgrade.currentValue.toFixed(1)}`, { 
        fontSize: '18px',
        fill: '#ffffff'
      }).setOrigin(0, 0.5);
      
      const descText = this.add.text(200, upgrade.y + 25, upgrade.description, { 
        fontSize: '14px',
        fill: '#aaaaaa'
      }).setOrigin(0, 0.5);
      
      const upgradeButton = this.add.text(600, upgrade.y, 'Upgrade', { 
        fontSize: '18px',
        fill: this.skillPoints > 0 ? '#00ff00' : '#555555',
        backgroundColor: '#333333',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setOrigin(0.5);
      
      if (this.skillPoints > 0) {
        upgradeButton.setInteractive({ useHandCursor: true })
          .on('pointerover', () => {
            upgradeButton.setStyle({ fill: '#ffffff' });
            this.showTooltip(`Upgrade ${upgrade.name} by ${upgrade.amount}`, upgradeButton.x, upgradeButton.y - 40);
          })
          .on('pointerout', () => {
            upgradeButton.setStyle({ fill: '#00ff00' });
            this.hideTooltip();
          })
          .on('pointerdown', () => {
            if (this.skillPoints > 0) {
              this.upgradeSkill(upgrade);
              this.skillPointsText.setText(`Available Skill Points: ${this.skillPoints}`);
              statText.setText(`${upgrade.name}: ${this.playerStats[upgrade.stat].toFixed(1)}`);
              
              if (this.skillPoints <= 0) {
                upgradeButton.setStyle({ fill: '#555555' });
                upgradeButton.disableInteractive();
                this.hideTooltip();
              }
            }
          });
      }
      
      this.upgradesContainer.add([statText, descText, upgradeButton]);
    });
  }
  
  createSpecialButtons() {
    const canUnlockSpecial = this.playerStats.level >= 5;
    const nextSpecialLevel = Math.floor(this.playerStats.level / 5) * 5;
    const canUpgradeSpecialNow = nextSpecialLevel > this.playerStats.lastSpecialUpgradeLevel;
    
    const infoText = this.add.text(400, 200, 
      canUnlockSpecial 
        ? (canUpgradeSpecialNow 
            ? 'Choose a special ability:' 
            : `Next special ability available at level ${this.playerStats.lastSpecialUpgradeLevel + 5}`)
        : 'Special abilities available starting from level 5', 
      { fontSize: '18px', fill: '#ffffff' }
    ).setOrigin(0.5);
    
    this.specialsContainer.add(infoText);
    
    if (!canUnlockSpecial) {
      return;
    }
    
    const specials = [
      {
        name: 'Pierce',
        description: 'Projectiles pierce through enemies and continue flying',
        key: 'pierce',
        maxLevel: 3,
        levelDesc: ['1 enemy', '2 enemies', '3 enemies'],
        y: 250
      },
      {
        name: 'Claws',
        description: 'Deal damage to all enemies around you',
        key: 'claw',
        maxLevel: 3,
        levelDesc: ['Small power', 'Medium power', 'Large power'],
        y: 320,
      },
      {
        name: 'Shotgun',
        description: 'well you know what it is',
        key: 'shotgun',
        maxLevel: 3,
        levelDesc: ['Weak power', 'Medium power', 'Strong power'],
        y: 390,
      },
      {
        name: 'Turret',
        description: 'Places a turret that automatically shoots at enemies',
        key: 'turret',
        maxLevel: 3,
        levelDesc: ['weak turret', 'medium turret', 'strong turret'],
        y: 460,
      }
    ];
    
    specials.forEach(special => {
      const requiredLevel = special.requiredLevel || 5;
      const isAvailable = this.playerStats.level >= requiredLevel;
      const currentLevel = this.playerStats.specials[special.key];
      const canUpgrade = isAvailable && currentLevel < special.maxLevel && this.skillPoints > 0 && canUpgradeSpecialNow;
      
      const nameText = this.add.text(200, special.y, 
        `${special.name} ${currentLevel > 0 ? `(Lvl ${currentLevel})` : ''}`, { 
        fontSize: '20px',
        fill: isAvailable ? (currentLevel > 0 ? '#00ff00' : '#ffffff') : '#555555'
      }).setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          this.showTooltip(special.description, nameText.x + 200, nameText.y);
        })
        .on('pointerout', () => {
          this.hideTooltip();
        });
      
      let descriptionText = '';
      if (currentLevel > 0) {
        descriptionText += `Current: ${special.levelDesc[currentLevel-1]}`;
      }
      if (currentLevel < special.maxLevel && isAvailable) {
        if (descriptionText) descriptionText += ' | ';
        descriptionText += `Next: ${special.levelDesc[currentLevel]}`;
      }
      
      const descText = this.add.text(200, special.y + 25, 
        isAvailable ? descriptionText : `Requires level ${requiredLevel}`, { 
        fontSize: '14px',
        fill: isAvailable ? '#aaaaaa' : '#555555'
      }).setOrigin(0, 0.5);
      
      let buttonText = 'Unavailable';
      if (isAvailable) {
        buttonText = currentLevel >= special.maxLevel ? 'Maximum' : 'Upgrade';
      }
      
      const upgradeButton = this.add.text(600, special.y, buttonText, { 
        fontSize: '18px',
        fill: canUpgrade ? '#00ff00' : '#555555',
        backgroundColor: canUpgrade ? '#333333' : '#222222',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setOrigin(0.5);
      
      if (canUpgrade) {
        upgradeButton.setInteractive({ useHandCursor: true })
          .on('pointerover', () => {
            upgradeButton.setStyle({ fill: '#ffffff' });
            this.showTooltip(`Upgrade to level ${currentLevel + 1}: ${special.levelDesc[currentLevel]}`, upgradeButton.x, upgradeButton.y - 40);
          })
          .on('pointerout', () => {
            upgradeButton.setStyle({ fill: '#00ff00' });
            this.hideTooltip();
          })
          .on('pointerdown', () => {
            if (this.skillPoints > 0 && canUpgradeSpecialNow) {
              this.upgradeSpecial(special);
              this.skillPointsText.setText(`Available Skill Points: ${this.skillPoints}`);
              
              const newLevel = this.playerStats.specials[special.key];
              nameText.setText(`${special.name} (Lvl ${newLevel})`);
              nameText.setStyle({ fill: '#00ff00' });
              
              let newDesc = '';
              if (newLevel > 0) {
                newDesc += `Current: ${special.levelDesc[newLevel-1]}`;
              }
              if (newLevel < special.maxLevel) {
                if (newDesc) newDesc += ' | ';
                newDesc += `Next: ${special.levelDesc[newLevel]}`;
              }
              descText.setText(newDesc);
              
              if (newLevel >= special.maxLevel) {
                upgradeButton.setText('Maximum').setStyle({ fill: '#555555', backgroundColor: '#222222' }).disableInteractive();
              } else if (this.skillPoints <= 0 || !canUpgradeSpecialNow) {
                upgradeButton.setStyle({ fill: '#555555', backgroundColor: '#222222' }).disableInteractive();
              }
              
              this.hideTooltip();
              
              if (this.skillPoints <= 0) {
                this.updateAllButtons();
              }
              
              infoText.setText(`Next special ability available at level ${this.playerStats.lastSpecialUpgradeLevel + 5}`);
            }
          });
      }
      
      this.specialsContainer.add([nameText, descText, upgradeButton]);
    });
  }
  
  showTooltip(text, x, y) {
    this.tooltipText.setText(text);
    this.tooltipText.setPosition(x, y);
    this.tooltipText.setAlpha(1);
  }
  
  hideTooltip() {
    this.tooltipText.setAlpha(0);
  }
  
  updateAllButtons() {
    this.children.list.forEach(child => {
      if (child.type === 'Text' && child.text === 'Upgrade' && child.input && child.input.enabled) {
        child.setStyle({ fill: '#555555', backgroundColor: '#222222' });
        child.disableInteractive();
      }
    });
  }
  
  upgradeSkill(upgrade) {
    if (this.skillPoints <= 0) return;
    
    this.playerStats[upgrade.stat] += upgrade.amount;
    
    if (upgrade.stat === 'maxHealth') {
      this.playerStats.health = this.playerStats.maxHealth;
    }
    
    this.skillPoints--;
    this.playerStats.skillPoints = this.skillPoints;
  }
  
  upgradeSpecial(special) {
    if (this.skillPoints <= 0) return;
    
    if (this.playerStats.specials[special.key] >= special.maxLevel) return;
    
    const nextSpecialLevel = Math.floor(this.playerStats.level / 5) * 5;
    if (nextSpecialLevel <= this.playerStats.lastSpecialUpgradeLevel) return;
    
    this.playerStats.specials[special.key]++;
    this.playerStats.lastSpecialUpgradeLevel = nextSpecialLevel;
    
    this.skillPoints--;
    this.playerStats.skillPoints = this.skillPoints;
  }
}