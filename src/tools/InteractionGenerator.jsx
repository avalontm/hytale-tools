import React, { useState, useEffect } from 'react';
import { useDialog } from '../contexts/DialogContext';
import JSZip from 'jszip';

export default function InteractionGenerator() {
    const { showAlert, showConfirm } = useDialog();
    const [npcId, setNpcId] = useState('');
    const [fileLoaded, setFileLoaded] = useState(false);
    const [dialogue, setDialogue] = useState({
        title: '',
        text: '',
        completedText: '', // New field
        options: []
    });
    const [interactionType, setInteractionType] = useState('QUEST'); // 'QUEST', 'SHOP', 'DIALOG_ONLY'
    const [quest, setQuest] = useState({
        title: '',
        description: 'Help me collect some items.',
        completionMessage: 'Thank you! Here is your reward.',
        objectives: [],
        rewards: []
    });
    const [shop, setShop] = useState({
        title: '',
        type: 'buy',
        items: []
    });
    const [roleConfig, setRoleConfig] = useState({
        displayName: '',
        isStatic: true
    });

    useEffect(() => {
        if (npcId) {
            setQuest(prev => ({ ...prev, title: `${npcId}'s Quest` }));
            setShop(prev => ({ ...prev, title: `${npcId}'s Shop` }));
        }
    }, [npcId]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                // Attempt to find ID from file content or filename
                let detectedId = file.name.replace('.json', '');

                // If it's a Role file, looks for Appearance or Modify.Appearance
                if (json.Modify && json.Modify.Appearance) {
                    detectedId = json.Modify.Appearance;
                }

                setNpcId(detectedId);
                setDialogue(prev => ({ ...prev, title: detectedId }));
                setRoleConfig(prev => ({ ...prev, displayName: detectedId })); // Default display name
                setFileLoaded(true);
                showAlert(`Loaded NPC: ${detectedId}`, 'Success');
            } catch (err) {
                showAlert('Invalid JSON file', 'Error');
            }
        };
        reader.readAsText(file);
    };

    const addOption = () => {
        setDialogue(prev => ({
            ...prev,
            options: [...prev.options, { text: '', actionType: 'NONE' }]
        }));
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...dialogue.options];
        newOptions[index][field] = value;

        // Auto-configure action string based on type
        // Auto-configure action string based on type
        if (field === 'actionType') {
            const questId = `${npcId.toLowerCase()}_quest`;

            if (value === 'QUEST') {
                if (!quest) initQuest();
                newOptions[index].action = `ACCEPT_QUEST:${questId}`;
            } else if (value === 'CHECK_QUEST') {
                if (!quest) initQuest();
                newOptions[index].action = `CHECK_QUEST:${questId}`;
            } else if (value === 'HIDE_IF_COMPLETED') {
                if (!quest) initQuest();
                newOptions[index].action = `HIDE_IF_COMPLETED:${questId}`;
            } else if (value === 'SHOW_IF_COMPLETED') {
                if (!quest) initQuest();
                newOptions[index].action = `SHOW_IF_COMPLETED:${questId}`;
            } else if (value === 'SHOP') {
                if (!shop) initShop();
                newOptions[index].action = `OPEN_SHOP:${npcId.toLowerCase()}_shop`;
            } else {
                newOptions[index].action = 'CLOSE_DIALOG';
            }
        }

        setDialogue(prev => ({ ...prev, options: newOptions }));
    };

    const initQuest = () => {
        setQuest({
            title: `${npcId}'s Quest`,
            description: 'Help me collect some items.',
            completionMessage: 'Thank you! Here is your reward.', // New field
            objectives: [],
            rewards: []
        });
    };

    const initShop = () => {
        setShop({
            title: `${npcId}'s Shop`,
            type: 'buy',
            items: []
        });
    };

    // Derived state for exclusivity
    const hasQuestOption = dialogue.options.some(o => o.actionType === 'QUEST');
    const hasShopOption = dialogue.options.some(o => o.actionType === 'SHOP');

    const generateZip = async () => {
        if (!npcId) {
            showAlert('Please load an NPC file first.', 'Error');
            return;
        }

        const zip = new JSZip();
        const serverFolder = zip.folder("Server");
        const npcFolder = serverFolder.folder("NPC");

        // 1. Generate Interaction JSON
        const interactionId = npcId;
        const interactionData = {
            [interactionId]: {
                type: "DIALOG",
                title: dialogue.title,
                text: dialogue.text,
                ...(quest && { completedText: dialogue.completedText }), // Conditional add
                options: dialogue.options.map(opt => ({
                    text: opt.text,
                    action: opt.action
                }))
            }
        };

        // Add quest/shop linkage fields
        if (quest) {
            const qId = `${npcId.toLowerCase()}_quest`;
            interactionData[interactionId].questId = qId;
        }

        if (shop) {
            interactionData[interactionId].shopId = `${npcId.toLowerCase()}_shop`;
        }

        // 1b. Generate Updated Role JSON
        const roleData = {
            Type: "Variant",
            Reference: roleConfig.isStatic ? "Template_Temple" : "Template_Intelligent",
            Modify: {
                Appearance: npcId,
                NameTranslationKey: roleConfig.displayName,
                ...(roleConfig.isStatic ? {
                    MotionStatic: true,
                    MaxSpeed: 0.1
                } : {
                    MaxHealth: 100, // Default for non-static
                    DefaultPlayerAttitude: "Neutral"
                })
            }
        };

        // Add Role to ZIP
        npcFolder.folder("Roles").file(`${npcId}.json`, JSON.stringify(roleData, null, 4));

        npcFolder.folder("Interactions").file(`${npcId}_interactions.json`, JSON.stringify(interactionData, null, 4));

        // 2. Generate Quest JSON
        if (quest) {
            const qId = `${npcId.toLowerCase()}_quest`;
            const questData = {
                [qId]: {
                    title: quest.title,
                    description: quest.description,
                    completionMessage: quest.completionMessage,
                    repeatable: false,
                    objectives: quest.objectives,
                    rewards: quest.rewards
                }
            };
            npcFolder.folder("Quests").file(`${qId}.json`, JSON.stringify(questData, null, 4));
        }

        // 3. Generate Shop JSON
        if (shop) {
            const sId = `${npcId.toLowerCase()}_shop`;

            // Format items to flat structure per user request
            const formattedItems = shop.items.map(item => {
                const flatItem = {
                    id: item.id,
                    name: item.name || item.id, // Default to ID if name missing
                    amount: item.amount || 1
                };

                // Assign prices based on shop type (or both if we had UI for it)
                // For now, we map the active UI price to the correct key.
                if (shop.type === 'buy') {
                    flatItem.buyPrice = item.buyPrice;
                    flatItem.sellPrice = Math.floor(item.buyPrice / 2); // Default sell price auto-calc
                } else {
                    flatItem.sellPrice = item.sellPrice;
                    flatItem.buyPrice = item.sellPrice * 2; // Default buy price auto-calc
                }

                return flatItem;
            });

            const shopData = {
                [sId]: {
                    id: sId,
                    title: shop.title,
                    type: shop.type,
                    items: formattedItems
                }
            };
            npcFolder.folder("Shops").file(`${sId}.json`, JSON.stringify(shopData, null, 4));
        }

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `AvalonInteractions_${npcId}.zip`;
            link.click();
            URL.revokeObjectURL(url);
            showAlert('Downloads started!', 'Success');
        } catch (err) {
            console.error(err);
            showAlert('Error creating ZIP', 'Error');
        }
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '40px',
            border: '1px solid var(--border-color)',
            color: 'white'
        }}>
            <h2 style={{ marginTop: 0 }}>Interaction Generator</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                Create Dialogues, Quests, and Shops for an existing NPC.
            </p>

            {/* Step 1: Load NPC */}
            <div style={{ marginBottom: '30px', padding: '20px', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                <h3 style={{ marginTop: 0 }}>Step 1: Load NPC JSON</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                    Upload the generated NPC role file to link interactions.
                    <br />
                    <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: '4px' }}>
                        \mods\AvalonTMEssentials\Server\NPC\Roles
                    </span>
                </p>
                <label
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '30px',
                        border: '2px dashed var(--accent-blue)',
                        borderRadius: '12px',
                        background: 'rgba(0, 150, 255, 0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(0, 150, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(0, 150, 255, 0.05)';
                    }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📄</div>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent-blue)' }}>Click to Select File</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '5px' }}>or drag and drop JSON here</span>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </label>
                {fileLoaded && <div style={{ color: 'var(--accent-green)', marginTop: '10px' }}>✓ Targeting NPC ID: <strong>{npcId}</strong></div>}
            </div>

            {fileLoaded && (
                <>
                    {/* Step 2: Interaction Mode */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0 }}>Step 2: Select Interaction Type</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            {[
                                { id: 'QUEST', label: 'Quest Giver', icon: '📜', desc: 'Offers tasks to players with objectives and rewards.' },
                                { id: 'SHOP', label: 'Merchant', icon: '💰', desc: 'Buys and sells items using a configurable currency.' },
                                { id: 'DIALOG_ONLY', label: 'Dialogue Only', icon: '💬', desc: 'Simple conversation branching without game logic.' }
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => setInteractionType(opt.id)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '20px',
                                        borderRadius: '10px',
                                        border: interactionType === opt.id
                                            ? '2px solid var(--accent-blue)'
                                            : '1px solid var(--border-color)',
                                        background: interactionType === opt.id
                                            ? 'rgba(0, 150, 255, 0.1)'
                                            : 'var(--bg-primary)',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}
                                    onMouseEnter={e => {
                                        if (interactionType !== opt.id) e.currentTarget.style.borderColor = 'var(--text-secondary)';
                                    }}
                                    onMouseLeave={e => {
                                        if (interactionType !== opt.id) e.currentTarget.style.borderColor = 'var(--border-color)';
                                    }}
                                >
                                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{opt.icon}</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: interactionType === opt.id ? 'var(--accent-blue)' : 'white' }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                        {opt.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Dialogue Editor */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3>Step 3: Edit Dialogue</h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={dialogue.title}
                                    onChange={e => setDialogue({ ...dialogue, title: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label>Greeting Text</label>
                                <textarea
                                    value={dialogue.text}
                                    onChange={e => setDialogue({ ...dialogue, text: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '80px' }}
                                />
                            </div>
                            <div>
                                <label>Completed Text (After Quest)</label>
                                <textarea
                                    value={dialogue.completedText}
                                    onChange={e => setDialogue({ ...dialogue, completedText: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '60px' }}
                                    placeholder="Text to show when the player has finished the quest..."
                                />
                            </div>

                            <div>
                                <label>Player Options</label>
                                {dialogue.options.map((opt, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            placeholder="Button Text"
                                            value={opt.text}
                                            onChange={e => updateOption(idx, 'text', e.target.value)}
                                            style={{ ...inputStyle, flex: 2 }}
                                        />
                                        <select
                                            value={opt.actionType}
                                            onChange={e => updateOption(idx, 'actionType', e.target.value)}
                                            style={{ ...inputStyle, flex: 1 }}
                                        >
                                            <option value="NONE">Close Dialog</option>

                                            {interactionType === 'QUEST' && (
                                                <>
                                                    <option value="QUEST">Accept Quest</option>
                                                    <option value="CHECK_QUEST">Check Quest Progress</option>
                                                    <option value="HIDE_IF_COMPLETED">Hide if Completed</option>
                                                    <option value="SHOW_IF_COMPLETED">Show if Completed</option>
                                                </>
                                            )}

                                            {interactionType === 'SHOP' && (
                                                <option value="SHOP">Open Shop</option>
                                            )}
                                        </select>
                                        <button onClick={async () => {
                                            if (await showConfirm('Are you sure you want to remove this option?', 'Remove Option', { isDestructive: true, confirmText: 'Remove' })) {
                                                const newOptions = dialogue.options.filter((_, i) => i !== idx);
                                                setDialogue({ ...dialogue, options: newOptions });
                                            }
                                        }} style={{ ...btnSmallStyle, background: 'var(--accent-red)', height: '42px', marginTop: '5px' }}>×</button>
                                    </div>
                                ))}
                                <button onClick={addOption} className="btn-secondary" style={btnSmallStyle}>+ Add Option</button>
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Role Configuration */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3>Step 4: NPC Configuration</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            <div>
                                <label>Display Name (In-Game)</label>
                                <input
                                    type="text"
                                    value={roleConfig.displayName}
                                    onChange={e => setRoleConfig({ ...roleConfig, displayName: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. Master Blacksmith"
                                />
                                <small style={{ color: 'var(--text-muted)' }}>This name will appear above the NPC. Static behavior is enforced effectively.</small>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Editors */}
                    {interactionType === 'QUEST' && quest && (
                        <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid var(--accent-yellow)' }}>
                            <h3 style={{ marginTop: 0, color: 'var(--accent-yellow)' }}>Quest Configuration</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quest ID will be: {npcId.toLowerCase()}_quest</p>

                            <label>Quest Title</label>
                            <input
                                value={quest.title}
                                onChange={e => setQuest({ ...quest, title: e.target.value })}
                                style={inputStyle}
                            />

                            <label>Description</label>
                            <textarea
                                value={quest.description}
                                onChange={e => setQuest({ ...quest, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: '60px' }}
                            />

                            <label>Completion Message (Reward Popup)</label>
                            <textarea
                                value={quest.completionMessage}
                                onChange={e => setQuest({ ...quest, completionMessage: e.target.value })}
                                style={{ ...inputStyle, minHeight: '50px' }}
                            />

                            {/* Objectives Editor */}
                            <div style={{ marginTop: '15px' }}>
                                <label>Quest Objectives</label>
                                {quest.objectives.map((obj, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                        <select
                                            value={obj.type}
                                            onChange={e => {
                                                const newObjs = [...quest.objectives];
                                                newObjs[i].type = e.target.value;
                                                setQuest({ ...quest, objectives: newObjs });
                                            }}
                                            style={{ ...inputStyle, flex: 1 }}
                                        >
                                            <option value="COLLECT">Collect</option>
                                            <option value="KILL">Kill</option>
                                        </select>
                                        <input
                                            placeholder="Target ID (e.g. Iron_Bar)"
                                            value={obj.target}
                                            onChange={e => {
                                                const newObjs = [...quest.objectives];
                                                newObjs[i].target = e.target.value;
                                                setQuest({ ...quest, objectives: newObjs });
                                            }}
                                            style={{ ...inputStyle, flex: 2 }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={obj.amount}
                                            onChange={e => {
                                                const newObjs = [...quest.objectives];
                                                newObjs[i].amount = parseInt(e.target.value) || 1;
                                                setQuest({ ...quest, objectives: newObjs });
                                            }}
                                            style={{ ...inputStyle, flex: 1 }}
                                        />
                                        <button onClick={async () => {
                                            if (await showConfirm('Remove this objective?', 'Remove Objective', { isDestructive: true, confirmText: 'Remove' })) {
                                                const newObjs = quest.objectives.filter((_, idx) => idx !== i);
                                                setQuest({ ...quest, objectives: newObjs });
                                            }
                                        }} style={{ ...btnSmallStyle, background: 'var(--accent-red)' }}>×</button>
                                    </div>
                                ))}
                                <button onClick={() => setQuest({
                                    ...quest,
                                    objectives: [...quest.objectives, { type: 'COLLECT', target: '', amount: 1 }]
                                })} style={btnSmallStyle}>+ Add Objective</button>
                            </div>

                            {/* Rewards Editor */}
                            <div style={{ marginTop: '15px' }}>
                                <label>Quest Rewards</label>
                                {quest.rewards.map((rew, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                        <select
                                            value={rew.type}
                                            onChange={e => {
                                                const newRews = [...quest.rewards];
                                                newRews[i].type = e.target.value;
                                                setQuest({ ...quest, rewards: newRews });
                                            }}
                                            style={{ ...inputStyle, flex: 1 }}
                                        >
                                            <option value="MONEY">Money</option>
                                            <option value="ITEM">Item</option>
                                        </select>
                                        {rew.type === 'ITEM' && (
                                            <input
                                                placeholder="Item ID"
                                                value={rew.id || ''}
                                                onChange={e => {
                                                    const newRews = [...quest.rewards];
                                                    newRews[i].id = e.target.value;
                                                    setQuest({ ...quest, rewards: newRews });
                                                }}
                                                style={{ ...inputStyle, flex: 2 }}
                                            />
                                        )}
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={rew.amount}
                                            onChange={e => {
                                                const newRews = [...quest.rewards];
                                                newRews[i].amount = parseInt(e.target.value) || 1;
                                                setQuest({ ...quest, rewards: newRews });
                                            }}
                                            style={{ ...inputStyle, flex: 1 }}
                                        />
                                        <button onClick={async () => {
                                            if (await showConfirm('Remove this reward?', 'Remove Reward', { isDestructive: true, confirmText: 'Remove' })) {
                                                const newRews = quest.rewards.filter((_, idx) => idx !== i);
                                                setQuest({ ...quest, rewards: newRews });
                                            }
                                        }} style={{ ...btnSmallStyle, background: 'var(--accent-red)' }}>×</button>
                                    </div>
                                ))}
                                <button onClick={() => setQuest({
                                    ...quest,
                                    rewards: [...quest.rewards, { type: 'MONEY', amount: 100 }]
                                })} style={btnSmallStyle}>+ Add Reward</button>
                            </div>
                        </div>
                    )}

                    {interactionType === 'SHOP' && shop && (
                        <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid var(--accent-blue)' }}>
                            <h3 style={{ marginTop: 0, color: 'var(--accent-blue)' }}>Shop Configuration</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Shop ID will be: {npcId.toLowerCase()}_shop</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label>Shop Title</label>
                                    <input
                                        value={shop.title}
                                        onChange={e => setShop({ ...shop, title: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label>Shop Type</label>
                                    <select
                                        value={shop.type}
                                        onChange={e => setShop({ ...shop, type: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="buy">Player Buys (Merchant)</option>
                                        <option value="sell">Player Sells (Buyer)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <label>Shop Inventory</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 0.5fr 1fr auto', gap: '8px', marginBottom: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <div>Item ID</div>
                                    <div>Display Name</div>
                                    <div>Qty</div>
                                    <div>Price (Gold)</div>
                                    <div></div>
                                </div>
                                {shop.items.map((item, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 0.5fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            placeholder="ID (e.g. Weapon_Sword)"
                                            value={item.id}
                                            onChange={e => {
                                                const newItems = [...shop.items];
                                                newItems[i].id = e.target.value;
                                                setShop({ ...shop, items: newItems });
                                            }}
                                            style={inputStyle}
                                        />
                                        <input
                                            placeholder="Name (e.g. Iron Sword)"
                                            value={item.name || ''}
                                            onChange={e => {
                                                const newItems = [...shop.items];
                                                newItems[i].name = e.target.value;
                                                setShop({ ...shop, items: newItems });
                                            }}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="number"
                                            placeholder="1"
                                            value={item.amount}
                                            onChange={e => {
                                                const newItems = [...shop.items];
                                                newItems[i].amount = parseInt(e.target.value) || 1;
                                                setShop({ ...shop, items: newItems });
                                            }}
                                            style={inputStyle}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={shop.type === 'buy' ? item.buyPrice : item.sellPrice}
                                            onChange={e => {
                                                const newItems = [...shop.items];
                                                const val = parseInt(e.target.value) || 0;
                                                if (shop.type === 'buy') newItems[i].buyPrice = val;
                                                else newItems[i].sellPrice = val;
                                                setShop({ ...shop, items: newItems });
                                            }}
                                            style={inputStyle}
                                        />
                                        <button onClick={async () => {
                                            if (await showConfirm('Remove this item from the shop?', 'Remove Shop Item', { isDestructive: true, confirmText: 'Remove' })) {
                                                const newItems = shop.items.filter((_, idx) => idx !== i);
                                                setShop({ ...shop, items: newItems });
                                            }
                                        }} style={{ ...btnSmallStyle, background: 'var(--accent-red)', height: '42px' }}>×</button>
                                    </div>
                                ))}
                                <button onClick={() => setShop({
                                    ...shop,
                                    items: [...shop.items, { id: '', name: '', amount: 1, buyPrice: 10, sellPrice: 5 }]
                                })} style={btnSmallStyle}>+ Add Item</button>
                            </div>

                        </div>
                    )}

                    <button onClick={generateZip} className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                        Generate Interaction Pack
                    </button>
                </>
            )}
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '10px',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid var(--border-color)',
    borderRadius: '5px',
    color: 'white',
    marginTop: '5px',
    marginBottom: '10px'
};

const btnSmallStyle = {
    padding: '5px 10px',
    fontSize: '12px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '4px'
};
