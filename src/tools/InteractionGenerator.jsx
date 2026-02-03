import React, { useState, useEffect } from 'react';
import { useDialog } from '../contexts/DialogContext';
import JSZip from 'jszip';
import { createNpcRole, DEFAULT_NPC_ROLE_VALUES } from '../utils/hytaleFormat';



const ItemSearchInput = ({ value, onChange, placeholder, availableItems, inputStyle }) => {
    const [searchTerm, setSearchTerm] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        const handleClick = () => setIsOpen(false);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    useEffect(() => {
        if (!searchTerm || !availableItems) {
            setFilteredItems([]);
            return;
        }
        const filtered = availableItems.filter(item =>
            item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 50);
        setFilteredItems(filtered);
    }, [searchTerm, availableItems]);

    return (
        <div style={{ position: 'relative', flex: 2 }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
                <input
                    placeholder={placeholder || "🔍 Search item ID..."}
                    value={searchTerm}
                    onChange={e => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        onChange(e.target.value);
                    }}
                    onFocus={() => setIsOpen(true)}
                    style={{ ...inputStyle, marginBottom: 0, paddingLeft: '35px' }}
                />
                <span style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.5,
                    pointerEvents: 'none',
                    fontSize: '14px'
                }}>🔍</span>
            </div>
            {isOpen && filteredItems.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 5px)',
                    left: 0,
                    right: 0,
                    maxHeight: '250px',
                    overflowY: 'auto',
                    background: '#1a2635',
                    border: '1px solid var(--accent-blue)',
                    borderRadius: '8px',
                    zIndex: 9999,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
                    padding: '5px'
                }}>
                    <div style={{ padding: '5px 10px', fontSize: '11px', color: 'var(--accent-blue)', fontWeight: 'bold', borderBottom: '1px solid rgba(0, 150, 255, 0.2)', marginBottom: '5px' }}>
                        MATCHING ITEMS
                    </div>
                    {filteredItems.map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => {
                                setSearchTerm(item.id);
                                onChange(item.id);
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '13px',
                                color: 'white',
                                marginBottom: '2px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 150, 255, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ fontWeight: '600' }}>{item.id}</span>
                            <span style={{ fontSize: '11px', color: 'var(--accent-blue)', background: 'rgba(0, 150, 255, 0.1)', padding: '2px 6px', borderRadius: '10px' }}>{item.category}</span>
                        </div>
                    ))}
                </div>
            )}
            {isOpen && searchTerm && filteredItems.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 5px)',
                    left: 0,
                    right: 0,
                    padding: '15px',
                    background: '#1a2635',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    zIndex: 9999,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '13px'
                }}>
                    No items found for "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default function InteractionGenerator() {
    const { showAlert, showConfirm } = useDialog();
    const [npcId, setNpcId] = useState('');
    const [fileLoaded, setFileLoaded] = useState(false);
    const [interactionLoaded, setInteractionLoaded] = useState(false);
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
        appearance: '',
        ...DEFAULT_NPC_ROLE_VALUES
    });

    useEffect(() => {
        if (npcId) {
            setQuest(prev => ({ ...prev, title: `${npcId}'s Quest` }));
            setShop(prev => ({ ...prev, title: `${npcId}'s Shop` }));
        }
    }, [npcId]);

    const handleNpcRoleLoad = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const fileName = file.name.replace('.json', '');

                // Use original filename AS the npcId
                setNpcId(fileName);

                // Strictly check for Role file details
                if (json.Modify) {
                    const appearance = json.Modify.Appearance || fileName;
                    const displayName = json.Modify.NameTranslationKey || fileName;

                    setDialogue(prev => ({ ...prev, title: displayName }));
                    setRoleConfig({
                        ...DEFAULT_NPC_ROLE_VALUES,
                        appearance: appearance,
                        displayName: displayName,
                        greetAnimation: json.Modify.GreetAnimation || DEFAULT_NPC_ROLE_VALUES.greetAnimation,
                        greetRange: json.Modify.GreetRange || DEFAULT_NPC_ROLE_VALUES.greetRange,
                        isStatic: json.Modify.MotionStatic !== undefined ? json.Modify.MotionStatic : DEFAULT_NPC_ROLE_VALUES.isStatic,
                        motionWander: json.Modify.MotionWander !== undefined ? json.Modify.MotionWander : DEFAULT_NPC_ROLE_VALUES.motionWander,
                    });

                    setFileLoaded(true);
                    showAlert(`Loaded NPC Role: ${fileName}`, 'Success');
                } else {
                    showAlert('Please upload a valid NPC Role file first.', 'Warning');
                }
            } catch (err) {
                showAlert('Invalid JSON file', 'Error');
            }
        };
        reader.readAsText(file);
    };

    const handleSecondaryDataLoad = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const keys = Object.keys(json);
                if (keys.length === 0) return;

                const firstKey = keys[0];
                const data = json[firstKey];

                // Check specifically for Interaction file first
                if (data.type === 'DIALOG') {
                    setDialogue({
                        title: data.title || firstKey,
                        text: data.text || '',
                        completedText: data.completedText || '',
                        options: (data.options || []).map(opt => {
                            let actionType = 'NONE';
                            if (opt.action) {
                                if (opt.action.startsWith('ACCEPT_QUEST')) actionType = 'QUEST';
                                else if (opt.action.startsWith('CHECK_QUEST')) actionType = 'CHECK_QUEST';
                                else if (opt.action.startsWith('HIDE_IF_COMPLETED')) actionType = 'HIDE_IF_COMPLETED';
                                else if (opt.action.startsWith('SHOW_IF_COMPLETED')) actionType = 'SHOW_IF_COMPLETED';
                                else if (opt.action.startsWith('OPEN_SHOP')) actionType = 'SHOP';
                            }
                            return { ...opt, actionType };
                        })
                    });

                    // Explicitly detect type based on ID presence
                    if (data.questId) {
                        setInteractionType('QUEST');
                    } else if (data.shopId) {
                        setInteractionType('SHOP');
                    } else {
                        setInteractionType('DIALOG_ONLY');
                    }

                    setInteractionLoaded(true);
                    showAlert(`Loaded Interaction: ${firstKey}`, 'Success');
                } else {
                    showAlert('Please upload a valid Interaction file (DIALOG) for Step 2.', 'Warning');
                }
            } catch (err) {
                showAlert('Invalid JSON file', 'Error');
            }
        };
        reader.readAsText(file);
    };

    const handleThirdStepLoad = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const keys = Object.keys(json);
                if (keys.length === 0) return;

                const firstKey = keys[0];
                const data = json[firstKey];

                // 2. Check if it's a Quest file
                if (data.objectives) {
                    setQuest({
                        title: data.title || '',
                        description: data.description || '',
                        completionMessage: data.completionMessage || '',
                        objectives: data.objectives || [],
                        rewards: data.rewards || []
                    });
                    setInteractionType('QUEST');
                    showAlert(`Loaded Quest data`, 'Success');
                }
                // 3. Check if it's a Shop file
                else if (data.items && data.type) {
                    setShop({
                        title: data.title || '',
                        type: data.type || 'buy',
                        items: (data.items || []).map(item => ({
                            id: item.id || '',
                            name: item.name || item.id || '',
                            amount: item.amount || 1,
                            buyPrice: item.buyPrice || 0,
                            sellPrice: item.sellPrice || 0
                        }))
                    });
                    setInteractionType('SHOP');
                    showAlert(`Loaded Shop data`, 'Success');
                } else {
                    showAlert('Please upload a valid Quest or Shop file for Step 3.', 'Warning');
                }
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

    const [availableItems, setAvailableItems] = useState([]);
    const [isItemsLoading, setIsItemsLoading] = useState(true);

    useEffect(() => {
        fetch('/items.json')
            .then(res => res.json())
            .then(data => {
                const flatItems = [];
                Object.entries(data).forEach(([category, ids]) => {
                    ids.forEach(id => {
                        flatItems.push({ id, category });
                    });
                });
                setAvailableItems(flatItems);
                setIsItemsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load items.json:', err);
                setIsItemsLoading(false);
            });
    }, []);

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
        const qId = `${npcId.toLowerCase()}_quest`;
        const sId = `${npcId.toLowerCase()}_shop`;

        const interactionData = {
            [interactionId]: {
                type: "DIALOG",
                title: dialogue.title,
                text: dialogue.text,
                ...(interactionType === 'QUEST' && { completedText: dialogue.completedText }),
                options: dialogue.options.map(opt => {
                    let action = opt.action;
                    // Auto-correct actions to match current NPC IDs
                    if (interactionType === 'QUEST' && action) {
                        if (action.startsWith('ACCEPT_QUEST:')) action = `ACCEPT_QUEST:${qId}`;
                        else if (action.startsWith('CHECK_QUEST:')) action = `CHECK_QUEST:${qId}`;
                        else if (action.startsWith('HIDE_IF_COMPLETED:')) action = `HIDE_IF_COMPLETED:${qId}`;
                        else if (action.startsWith('SHOW_IF_COMPLETED:')) action = `SHOW_IF_COMPLETED:${qId}`;
                    } else if (interactionType === 'SHOP' && action && action.startsWith('OPEN_SHOP:')) {
                        action = `OPEN_SHOP:${sId}`;
                    }
                    return {
                        text: opt.text,
                        action: action
                    };
                })
            }
        };

        // Add quest/shop linkage fields ONLY if matches selected type
        if (interactionType === 'QUEST') {
            const qId = `${npcId.toLowerCase()}_quest`;
            interactionData[interactionId].questId = qId;
        } else if (interactionType === 'SHOP') {
            interactionData[interactionId].shopId = `${npcId.toLowerCase()}_shop`;
        }

        // 1b. Generate Updated Role JSON using shared utility
        const roleData = createNpcRole({
            id: npcId,
            ...roleConfig
        });

        // Add Role to ZIP
        npcFolder.folder("Roles").file(`${npcId}.json`, JSON.stringify(roleData, null, 4));

        npcFolder.folder("Interactions").file(`${npcId}_interactions.json`, JSON.stringify(interactionData, null, 4));

        // 2. Generate Quest JSON
        if (interactionType === 'QUEST' && quest) {
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
        if (interactionType === 'SHOP' && shop) {
            const sId = `${npcId.toLowerCase()}_shop`;

            const formattedItems = shop.items.map(item => {
                const flatItem = {
                    id: item.id,
                    name: item.name || item.id,
                    amount: item.amount || 1
                };

                if (shop.type === 'buy') {
                    flatItem.buyPrice = item.buyPrice;
                    flatItem.sellPrice = Math.floor(item.buyPrice / 2);
                } else {
                    flatItem.sellPrice = item.sellPrice;
                    flatItem.buyPrice = item.sellPrice * 2;
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
                <h3 style={{ marginTop: 0 }}>Step 1: Load NPC Role</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                    Upload the main NPC role file first.
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
                >
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>👤</div>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--accent-blue)' }}>{fileLoaded ? 'NPC Role Loaded' : 'Select NPC Role File'}</span>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleNpcRoleLoad}
                        style={{ display: 'none' }}
                    />
                </label>

                {fileLoaded && (
                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--accent-blue)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold', fontSize: '16px' }}>✓ NPC Role: {npcId}.json</div>
                            <button
                                onClick={() => {
                                    setFileLoaded(false);
                                    setNpcId('');
                                }}
                                style={{ ...btnSmallStyle, background: 'rgba(255,0,0,0.2)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}
                            >Reset</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>File Name / NPC ID</label>
                                <input
                                    value={npcId}
                                    onChange={e => setNpcId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                    style={{ ...inputStyle, marginBottom: 0, marginTop: '5px', borderColor: 'var(--accent-blue)', fontWeight: 'bold' }}
                                    placeholder="e.g. bartender"
                                />
                                <small style={{ color: 'rgba(0, 150, 255, 0.5)', fontSize: '9px' }}>Determines all filenames</small>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NameTranslationKey</label>
                                <input
                                    value={roleConfig.displayName}
                                    onChange={e => setRoleConfig({ ...roleConfig, displayName: e.target.value })}
                                    style={{ ...inputStyle, marginBottom: 0, marginTop: '5px' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Appearance (Model ID)</label>
                                <input
                                    value={roleConfig.appearance}
                                    onChange={e => setRoleConfig({ ...roleConfig, appearance: e.target.value })}
                                    style={{ ...inputStyle, marginBottom: 0, marginTop: '5px' }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '15px', background: 'rgba(0, 255, 0, 0.05)', borderRadius: '8px', border: '1px solid var(--accent-green)' }}>
                            <div style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Step 2: Load Interaction (Mandatory)</div>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                Load the base <span style={{ color: 'var(--accent-blue)' }}>{npcId}_interactions.json</span> file.
                            </p>
                            <label style={{ ...btnSmallStyle, display: 'inline-block', marginTop: '10px', background: interactionLoaded ? 'rgba(0,0,0,0.3)' : 'var(--accent-blue)', borderColor: interactionLoaded ? 'var(--border-color)' : 'var(--accent-blue)' }}>
                                {interactionLoaded ? '✓ Interaction Loaded' : '📂 Select Interaction File'}
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleSecondaryDataLoad}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>
                )}

                {interactionLoaded && (
                    <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(0, 150, 255, 0.05)', borderRadius: '8px', border: '1px solid var(--accent-blue)' }}>
                        <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Step 3: Load Quest or Shop (Optional)</div>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                            Import an existing <span style={{ color: 'var(--accent-blue)' }}>quest.json</span> or <span style={{ color: 'var(--accent-blue)' }}>shop.json</span>.
                        </p>
                        <label style={{ ...btnSmallStyle, display: 'inline-block', marginTop: '10px', background: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}>
                            📂 Select Quest/Shop File
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleThirdStepLoad}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                )}
            </div>

            {fileLoaded && (
                <>
                    {/* Step 2: Interaction Mode */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0 }}>Step 2: Define Interaction Type (Required)</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                            Every NPC needs an Interaction file. Choose if this interaction links to a Quest or Shop.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            {[
                                { id: 'QUEST', label: 'Quest Giver', icon: '📜', desc: 'Mandatory Dialog + Optional Quest JSON' },
                                { id: 'SHOP', label: 'Merchant', icon: '💰', desc: 'Mandatory Dialog + Optional Shop JSON' },
                                { id: 'DIALOG_ONLY', label: 'Dialogue Only', icon: '💬', desc: 'Mandatory Dialog only' }
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
                                >
                                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{opt.icon}</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: interactionType === opt.id ? 'var(--accent-blue)' : 'white' }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                                        {opt.desc}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Dialogue Editor */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3>Step 3: Edit Interaction (Mandatory)</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                            This creates the base <span style={{ color: 'var(--accent-blue)' }}>{npcId}_interactions.json</span> file.
                        </p>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <div>
                                <label>NameTranslationKey (Display Name)</label>
                                <input
                                    type="text"
                                    value={roleConfig.displayName}
                                    onChange={e => setRoleConfig({ ...roleConfig, displayName: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. Master Blacksmith"
                                />
                            </div>
                            <div>
                                <label>Appearance (Model ID)</label>
                                <input
                                    type="text"
                                    value={roleConfig.appearance}
                                    onChange={e => setRoleConfig({ ...roleConfig, appearance: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. Human"
                                />
                                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '-5px', fontSize: '10px' }}>Internal model ID (e.g. Human, Undead)</small>
                            </div>
                            <div>
                                <label>Greet Animation</label>
                                <input
                                    type="text"
                                    value={roleConfig.greetAnimation}
                                    onChange={e => setRoleConfig({ ...roleConfig, greetAnimation: e.target.value })}
                                    style={inputStyle}
                                    placeholder="e.g. Wave"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '10px' }}>
                            <div>
                                <label>Greet Range</label>
                                <input
                                    type="number"
                                    value={roleConfig.greetRange}
                                    onChange={e => setRoleConfig({ ...roleConfig, greetRange: parseInt(e.target.value) || 0 })}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
                                <input
                                    type="checkbox"
                                    id="isStatic"
                                    checked={roleConfig.isStatic}
                                    onChange={e => setRoleConfig({ ...roleConfig, isStatic: e.target.checked })}
                                />
                                <label htmlFor="isStatic" style={{ cursor: 'pointer', marginBottom: 0 }}>Motion Static</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
                                <input
                                    type="checkbox"
                                    id="motionWander"
                                    checked={roleConfig.motionWander}
                                    onChange={e => setRoleConfig({ ...roleConfig, motionWander: e.target.checked })}
                                />
                                <label htmlFor="motionWander" style={{ cursor: 'pointer', marginBottom: 0 }}>Motion Wander</label>
                            </div>
                        </div>
                        <small style={{ color: 'var(--text-muted)' }}>Configure basic NPC behavior and look.</small>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{ margin: 0 }}>Quest Objectives</label>
                                    <button onClick={() => setQuest({
                                        ...quest,
                                        objectives: [...quest.objectives, { type: 'COLLECT', target: '', amount: 1 }]
                                    })} style={{ ...btnSmallStyle, background: 'var(--accent-blue)' }}>+ Add Objective</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 0.8fr auto', gap: '10px', marginBottom: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                    <div>TYPE</div>
                                    <div>TARGET (ID)</div>
                                    <div>AMOUNT</div>
                                    <div></div>
                                </div>
                                {quest.objectives.map((obj, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 0.8fr auto', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
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
                                        <ItemSearchInput
                                            placeholder="Target ID (e.g. Iron_Bar)"
                                            value={obj.target}
                                            availableItems={availableItems}
                                            inputStyle={inputStyle}
                                            onChange={val => {
                                                const newObjs = [...quest.objectives];
                                                newObjs[i].target = val;
                                                setQuest({ ...quest, objectives: newObjs });
                                            }}
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
                                        }} style={{ ...btnSmallStyle, background: 'var(--accent-red)', height: '100%' }}>×</button>
                                    </div>
                                ))}
                            </div>

                            {/* Rewards Editor */}
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{ margin: 0 }}>Quest Rewards</label>
                                    <button onClick={() => setQuest({
                                        ...quest,
                                        rewards: [...quest.rewards, { type: 'MONEY', amount: 100 }]
                                    })} style={{ ...btnSmallStyle, background: 'var(--accent-green)' }}>+ Add Reward</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 0.8fr auto', gap: '10px', marginBottom: '5px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                    <div>TYPE</div>
                                    <div>REWARD</div>
                                    <div>AMOUNT</div>
                                    <div></div>
                                </div>
                                {quest.rewards.map((rew, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 0.8fr auto', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
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
                                            <ItemSearchInput
                                                placeholder="Item ID"
                                                value={rew.id || ''}
                                                availableItems={availableItems}
                                                inputStyle={inputStyle}
                                                onChange={val => {
                                                    const newRews = [...quest.rewards];
                                                    newRews[i].id = val;
                                                    setQuest({ ...quest, rewards: newRews });
                                                }}
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
                                        }} style={{ ...btnSmallStyle, background: 'var(--accent-red)', height: '100%' }}>×</button>
                                    </div>
                                ))}
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
                                        <ItemSearchInput
                                            placeholder="ID (e.g. Weapon_Sword)"
                                            value={item.id}
                                            availableItems={availableItems}
                                            inputStyle={inputStyle}
                                            onChange={val => {
                                                const newItems = [...shop.items];
                                                newItems[i].id = val;
                                                setShop({ ...shop, items: newItems });
                                            }}
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
