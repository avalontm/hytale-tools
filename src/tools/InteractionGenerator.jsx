import React, { useState, useEffect } from 'react';
import { useDialog } from '../contexts/DialogContext';
import JSZip from 'jszip';
import { createNpcRole, DEFAULT_NPC_ROLE_VALUES, stripHytalePrefix, sanitizeItemId } from '../utils/hytaleFormat';



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
        <div style={{ position: 'relative', width: '100%', height: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <input
                    placeholder={placeholder || "🔍 Search item ID..."}
                    value={searchTerm}
                    onChange={e => {
                        const sanitized = sanitizeItemId(e.target.value);
                        setSearchTerm(sanitized);
                        setIsOpen(true);
                        onChange(sanitized);
                    }}
                    onFocus={() => setIsOpen(true)}
                    style={{ ...inputStyle, marginBottom: 0, paddingLeft: '35px', height: '100%' }}
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
                    background: '#0d1117',
                    border: '1px solid #30363d',
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

const ToggleSwitch = ({ label, checked, onChange, id }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 0 }}>{label}</label>
            <div
                onClick={() => onChange(!checked)}
                style={{
                    width: '50px',
                    height: '26px',
                    background: checked ? 'var(--accent-blue)' : '#333',
                    borderRadius: '13px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: checked ? '0 0 10px rgba(0, 150, 255, 0.3)' : 'none',
                    marginTop: '4px'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: checked ? '27px' : '3px',
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }} />
            </div>
        </div>
    );
};

export default function InteractionGenerator() {
    const { showAlert, showConfirm } = useDialog();
    const [npcId, setNpcId] = useState('');
    const [generatorMode, setGeneratorMode] = useState(null); // 'LOAD', 'NEW', or null
    const [fileLoaded, setFileLoaded] = useState(false);
    const [interactionLoaded, setInteractionLoaded] = useState(false);
    const [dialogue, setDialogue] = useState({
        title: '',
        text: 'Hello!',
        completedText: '',
        options: [{ text: 'Goodbye', action: 'close', actionType: 'NONE', requiredQuestId: '' }]
    });
    const [interactionType, setInteractionType] = useState('QUEST'); // 'QUEST', 'SHOP', 'DIALOG_ONLY'
    const [quest, setQuest] = useState({
        title: '',
        description: 'Help me collect some items.',
        requiredQuestId: '', // For quest chains
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
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [draggedOverIdx, setDraggedOverIdx] = useState(null);

    useEffect(() => {
        if (npcId) {
            setQuest(prev => ({ ...prev, title: `${npcId}'s Quest` }));
            setShop(prev => ({ ...prev, title: `${npcId}'s Shop` }));
        }
    }, [npcId]);

    // Hybrid interactions are now supported, so we no longer reset options
    // when the interaction type changes.
    useEffect(() => {
        const questId = `${npcId?.toLowerCase() || 'npc'}_quest`;
        const shopId = `${npcId?.toLowerCase() || 'npc'}_shop`;

        if (interactionType === 'QUEST') {
            if (!quest.title) initQuest();
            // If options are just the single default "Goodbye", upgrade to Quest defaults
            if (dialogue.options.length === 1 && (dialogue.options[0].actionType === 'NONE' || dialogue.options[0].text === 'Goodbye')) {
                setDialogue(prev => ({
                    ...prev,
                    options: [
                        { text: 'Help me!', action: `ACCEPT_QUEST:${questId}`, actionType: 'QUEST', requiredQuestId: '' },
                        { text: 'Hand in', action: `CHECK_QUEST:${questId}`, actionType: 'CHECK_QUEST', requiredQuestId: '' },
                        { text: 'Goodbye!', action: 'close', actionType: 'NONE', requiredQuestId: '' }
                    ]
                }));
            }
        }
        if (interactionType === 'SHOP') {
            if (!shop.title) initShop();
            // If options are just the single default "Goodbye", upgrade to Shop defaults
            if (dialogue.options.length === 1 && (dialogue.options[0].actionType === 'NONE' || dialogue.options[0].text === 'Goodbye')) {
                setDialogue(prev => ({
                    ...prev,
                    options: [
                        { text: 'Show me your wares', action: `OPEN_SHOP:${shopId}`, actionType: 'SHOP', requiredQuestId: '' },
                        { text: 'Goodbye!', action: 'close', actionType: 'NONE', requiredQuestId: '' }
                    ]
                }));
            }
        }
    }, [interactionType]); // Only trigger on type change

    // Sync NPC ID with Actions
    useEffect(() => {
        if (!npcId) return;

        const newQuestId = `${npcId.toLowerCase()}_quest`;
        const newShopId = `${npcId.toLowerCase()}_shop`;

        setDialogue(prev => ({
            ...prev,
            options: prev.options.map(opt => {
                let newAction = opt.action;
                // If the action looks like a default pattern, update it
                if (opt.actionType === 'QUEST' && (opt.action.startsWith('ACCEPT_QUEST:') || !opt.action)) {
                    newAction = `ACCEPT_QUEST:${newQuestId}`;
                } else if (opt.actionType === 'CHECK_QUEST' && (opt.action.startsWith('CHECK_QUEST:') || !opt.action)) {
                    newAction = `CHECK_QUEST:${newQuestId}`;
                } else if (opt.actionType === 'SHOP' && (opt.action.startsWith('OPEN_SHOP:') || !opt.action)) {
                    newAction = `OPEN_SHOP:${newShopId}`;
                } else if (opt.actionType === 'HIDE_IF_COMPLETED' && (opt.action.startsWith('HIDE_IF_COMPLETED:') || !opt.action)) {
                    newAction = `HIDE_IF_COMPLETED:${newQuestId}`;
                } else if (opt.actionType === 'SHOW_IF_COMPLETED' && (opt.action.startsWith('SHOW_IF_COMPLETED:') || !opt.action)) {
                    newAction = `SHOW_IF_COMPLETED:${newQuestId}`;
                }
                return { ...opt, action: newAction };
            })
        }));
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
                let data = json;
                let id = file.name.replace('.json', '');

                // Support both flat and nested JSON
                if (!json.type && !json.options && Object.keys(json).length === 1) {
                    id = Object.keys(json)[0];
                    data = json[id];
                }

                // Check specifically for Interaction file
                if (data.type === 'DIALOG' || data.type === 'QUEST' || data.type === 'SHOP') {
                    setDialogue({
                        title: data.title || id,
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
                                else if (opt.action === 'close') actionType = 'NONE';
                            }
                            return { ...opt, actionType, requiredQuestId: opt.requiredQuestId || '' };
                        })
                    });

                    // Detect interaction type
                    if (data.type === 'QUEST' || data.questId) {
                        setInteractionType('QUEST');
                    } else if (data.type === 'SHOP' || data.shopId) {
                        setInteractionType('SHOP');
                    } else {
                        setInteractionType('DIALOG_ONLY'); // Keep as fallback
                    }

                    setInteractionLoaded(true);
                    showAlert(`Loaded Interaction: ${id}`, 'Success');
                } else {
                    showAlert('Please upload a valid Interaction file.', 'Warning');
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
                let data = json;
                let id = file.name.replace('.json', '');

                if (!json.title && Object.keys(json).length === 1) {
                    id = Object.keys(json)[0];
                    data = json[id];
                }

                if (interactionType === 'QUEST') {
                    setQuest({
                        title: data.title || '',
                        description: data.description || '',
                        requiredQuestId: data.requiredQuestId || '',
                        objectives: (data.objectives || []).map(o => ({ ...o, amount: o.amount || 1 })),
                        rewards: (data.rewards || []).map(r => ({ ...r, amount: r.amount || 1 }))
                    });
                    showAlert(`Loaded Quest: ${id}`, 'Success');
                } else if (interactionType === 'SHOP') {
                    setShop({
                        title: data.title || '',
                        items: (data.items || []).map(i => ({
                            id: i.itemId || i.id || '',
                            amount: i.amount || 1,
                            buyPrice: i.buyPrice || 0,
                            sellPrice: i.sellPrice || 0
                        }))
                    });
                    showAlert(`Loaded Shop: ${id}`, 'Success');
                } else {
                    showAlert('Please upload a valid Quest or Shop file for Step 3.', 'Warning');
                }
            } catch (err) {
                showAlert('Invalid JSON file', 'Error');
            }
        };
        reader.readAsText(file);
    };

    const handleInteractionTypeChange = async (newType) => {
        if (newType === interactionType) return;

        // Check if there is meaningful data in options
        const hasData = dialogue.options.length > 1 ||
            (dialogue.options[0] && (
                (dialogue.options[0].text && dialogue.options[0].text !== 'Goodbye') ||
                dialogue.options[0].actionType !== 'NONE' ||
                dialogue.options[0].requiredQuestId
            ));

        if (hasData) {
            const confirmed = await showConfirm(
                'Changing the interaction type will reset your current options. Are you sure?',
                'Switch Interaction Type',
                { isDestructive: true, confirmText: 'Reset and Switch' }
            );
            if (!confirmed) return;
        }

        setInteractionType(newType);

        // Reset options based on new type
        const questId = `${npcId.toLowerCase()}_quest`;
        const shopId = `${npcId.toLowerCase()}_shop`;

        if (newType === 'QUEST') {
            setDialogue(prev => ({
                ...prev,
                options: [
                    { text: 'Help me!', action: `ACCEPT_QUEST:${questId}`, actionType: 'QUEST', requiredQuestId: '' },
                    { text: 'Hand in', action: `CHECK_QUEST:${questId}`, actionType: 'CHECK_QUEST', requiredQuestId: '' },
                    { text: 'Goodbye!', action: 'close', actionType: 'NONE', requiredQuestId: '' }
                ]
            }));
            if (!quest.title) initQuest();
        } else if (newType === 'SHOP') {
            setDialogue(prev => ({
                ...prev,
                options: [
                    { text: 'Show me your wares', action: `OPEN_SHOP:${shopId}`, actionType: 'SHOP', requiredQuestId: '' },
                    { text: 'Goodbye!', action: 'close', actionType: 'NONE', requiredQuestId: '' }
                ]
            }));
            if (!shop.title) initShop();
        } else {
            setDialogue(prev => ({
                ...prev,
                options: [{ text: 'Goodbye!', action: 'close', actionType: 'NONE', requiredQuestId: '' }]
            }));
        }
    };

    const addOption = () => {
        setDialogue(prev => ({
            ...prev,
            options: [...prev.options, { text: '', action: 'close', actionType: 'NONE', requiredQuestId: '' }]
        }));
    };

    const updateOption = (index, field, value) => {
        const newOptions = [...dialogue.options];
        newOptions[index][field] = value;

        // Auto-configure action string based on type
        if (field === 'actionType') {
            const questId = `${npcId.toLowerCase()}_quest`;
            const shopId = `${npcId.toLowerCase()}_shop`;

            if (value === 'QUEST') {
                if (!quest.title) initQuest();
                newOptions[index].action = `ACCEPT_QUEST:${questId}`;
            } else if (value === 'CHECK_QUEST') {
                if (!quest.title) initQuest();
                newOptions[index].action = `CHECK_QUEST:${questId}`;
            } else if (value === 'SHOP') {
                if (!shop.title) initShop();
                newOptions[index].action = `OPEN_SHOP:${shopId}`;
            } else if (value === 'HIDE_IF_COMPLETED') {
                if (!quest.title) initQuest();
                newOptions[index].action = `HIDE_IF_COMPLETED:${questId}`;
            } else if (value === 'SHOW_IF_COMPLETED') {
                if (!quest.title) initQuest();
                newOptions[index].action = `SHOW_IF_COMPLETED:${questId}`;
            } else if (value === 'DIALOG') {
                newOptions[index].action = 'DIALOG';
            } else {
                newOptions[index].action = 'close';
            }
        }

        setDialogue(prev => ({ ...prev, options: newOptions }));
    };

    const initQuest = () => {
        setQuest({
            title: `${npcId}'s Quest`,
            description: 'Help me collect some items.',
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
            title: dialogue.title,
            text: dialogue.text,
            completedText: dialogue.completedText || "",
            type: interactionType === 'DIALOG_ONLY' ? 'DIALOG' : interactionType,
            options: dialogue.options.map(opt => {
                let action = opt.action;
                // No more auto-overwriting manual edits, just ensure consistency for empty/fresh ones
                if (!action || action === 'close') {
                    if (opt.actionType === 'QUEST') action = `ACCEPT_QUEST:${qId}`;
                    else if (opt.actionType === 'CHECK_QUEST') action = `CHECK_QUEST:${qId}`;
                    else if (opt.actionType === 'SHOP') action = `OPEN_SHOP:${sId}`;
                    else if (opt.actionType === 'HIDE_IF_COMPLETED') action = `HIDE_IF_COMPLETED:${qId}`;
                    else if (opt.actionType === 'SHOW_IF_COMPLETED') action = `SHOW_IF_COMPLETED:${qId}`;
                    else if (opt.actionType === 'DIALOG') action = 'DIALOG';
                    else action = 'close';
                }
                return {
                    text: opt.text,
                    action: action,
                    requiredQuestId: opt.requiredQuestId ? stripHytalePrefix(opt.requiredQuestId) : undefined
                };
            })
        };

        // Flat Interaction JSON (as per new documentation)
        const interactionFileName = `${npcId}_interactions.json`;
        npcFolder.folder("Interactions").file(interactionFileName, JSON.stringify(interactionData, null, 4));

        // Generate Updated Role JSON using shared utility
        const roleData = createNpcRole({
            ...roleConfig,
            id: npcId,
            displayName: npcId // Use the Internal ID as the NameTranslationKey
        });

        // Add Role to ZIP
        npcFolder.folder("Roles").file(`${npcId}.json`, JSON.stringify(roleData, null, 4));

        // 2. Generate Quest JSON
        if (interactionType === 'QUEST' && quest) {
            const qId = `${npcId.toLowerCase()}_quest`;
            const questData = {
                id: qId,
                title: quest.title,
                description: quest.description,
                requiredQuestId: quest.requiredQuestId || undefined,
                objectives: quest.objectives.map(obj => ({
                    ...obj,
                    target: stripHytalePrefix(obj.target)
                })),
                rewards: quest.rewards.map(rew => ({
                    ...rew,
                    id: rew.type === 'ITEM' ? stripHytalePrefix(rew.id) : rew.id
                }))
            };
            npcFolder.folder("Quests").file(`${qId}.json`, JSON.stringify(questData, null, 4));
        }

        // 3. Generate Shop JSON
        if (interactionType === 'SHOP' && shop) {
            const sId = `${npcId.toLowerCase()}_shop`;

            const formattedItems = shop.items.map(item => {
                const flatItem = {
                    itemId: stripHytalePrefix(item.id || item.itemId),
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
                id: sId,
                title: shop.title,
                items: formattedItems
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

            {!generatorMode && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px', maxWidth: '900px', margin: '0 auto 40px auto' }}>
                    <div
                        onClick={() => setGeneratorMode('NEW')}
                        style={{
                            padding: '40px 30px',
                            border: '1px solid #333',
                            borderRadius: '16px',
                            background: 'linear-gradient(145deg, #1e1e1e, #141414)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent-blue)';
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 150, 255, 0.2)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#333';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                        }}
                    >
                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <img src="/static/images/GameModeIconCreative.png" alt="New" style={{ height: '80px', filter: 'drop-shadow(0 0 10px rgba(0,150,255,0.4))' }} />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: 'white' }}>New Configuration</h3>
                        <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: '1.4' }}>Start from scratch to create a brand new NPC interaction set.</p>
                    </div>

                    <div
                        onClick={() => setGeneratorMode('LOAD')}
                        style={{
                            padding: '40px 30px',
                            border: '1px solid #333',
                            borderRadius: '16px',
                            background: 'linear-gradient(145deg, #1e1e1e, #141414)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent-green)';
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 255, 150, 0.15)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#333';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                        }}
                    >
                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <img src="/static/images/GameModeIconAdventure.png" alt="Load" style={{ height: '80px', filter: 'drop-shadow(0 0 10px rgba(0,255,150,0.3))' }} />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: 'white' }}>Load Existing</h3>
                        <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: '1.4' }}>Upload an NPC Role file to modify its existing interactions.</p>
                    </div>
                </div>
            )}

            {generatorMode === 'NEW' && !fileLoaded && (
                <div style={{ marginBottom: '30px', padding: '30px', border: '1px solid var(--accent-blue)', borderRadius: '12px', background: 'rgba(0, 150, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Step 1: NPC Basics</h3>
                        <button onClick={() => setGeneratorMode(null)} style={{ ...btnSmallStyle, opacity: 0.6 }}>Back</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Internal NPC ID</label>
                            <input
                                value={npcId}
                                onChange={e => setNpcId(sanitizeItemId(e.target.value))}
                                style={{ ...inputStyle, marginBottom: 0, marginTop: '5px' }}
                                placeholder="e.g. guard_captain"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Appearance (Model)</label>
                            <input
                                value={roleConfig.appearance}
                                onChange={e => setRoleConfig({ ...roleConfig, appearance: e.target.value })}
                                style={{ ...inputStyle, marginBottom: 0, marginTop: '5px' }}
                                placeholder="e.g. Human"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (!npcId) return showAlert('Please enter an NPC ID', 'Warning');
                            setFileLoaded(true);
                        }}
                        className="btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: '600' }}
                    >Start Generating</button>
                </div>
            )}

            {generatorMode === 'LOAD' && !fileLoaded && (
                <div style={stepContainerStyle('var(--accent-blue)')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>Step 1: Load NPC Role</h3>
                        <button
                            onClick={() => setGeneratorMode(null)}
                            style={{ ...btnSmallStyle, height: '32px', padding: '0 12px', fontSize: '12px', opacity: 0.6 }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                        >Back</button>
                    </div>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '25px' }}>
                        Upload your primary <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>Role.json</span> file to get started.
                    </p>
                    <label
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '45px',
                            border: '1px dashed rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            background: 'rgba(255, 255, 255, 0.01)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent-blue)';
                            e.currentTarget.style.background = 'rgba(0, 150, 255, 0.03)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{ fontSize: '44px', marginBottom: '14px' }}>👤</div>
                        <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--accent-blue)' }}>Browse Role File</span>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleNpcRoleLoad}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            )}

            {fileLoaded && (
                <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid var(--accent-blue)', borderRadius: '12px', background: 'rgba(0, 150, 255, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ color: 'white', fontWeight: '800', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '-0.02em' }}>
                            <span style={{ color: 'var(--accent-blue)', fontSize: '24px' }}>✓</span> NPC Configured: {npcId}
                        </div>
                        <button
                            onClick={() => {
                                setFileLoaded(false);
                                setNpcId('');
                                if (generatorMode === 'LOAD') setGeneratorMode(null);
                            }}
                            style={{
                                ...btnSmallStyle,
                                background: 'rgba(255, 68, 68, 0.1)',
                                border: '1px solid rgba(255, 68, 68, 0.2)',
                                color: '#ff4444',
                                height: '36px',
                                padding: '0 16px',
                                borderRadius: '8px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)'}
                        >Reset</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Internal ID</label>
                            <input value={npcId} disabled style={{ ...inputStyle, opacity: 0.6, marginBottom: 0 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Appearance</label>
                            <input value={roleConfig.appearance} disabled style={{ ...inputStyle, opacity: 0.6, marginBottom: 0 }} />
                        </div>
                    </div>

                    {generatorMode === 'LOAD' && (
                        <div style={stepContainerStyle('var(--accent-green)')}>
                            <div style={{ color: 'white', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.02em' }}>Step 2: Load Interaction</div>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', marginBottom: '20px' }}>
                                Load the base <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>{npcId}_interactions.json</span> file.
                            </p>
                            <label
                                style={{
                                    ...btnSmallStyle,
                                    background: interactionLoaded ? 'rgba(255,255,255,0.05)' : 'var(--accent-blue)',
                                    borderColor: interactionLoaded ? 'rgba(255,255,255,0.1)' : 'var(--accent-blue)',
                                    height: '46px',
                                    padding: '0 24px',
                                    borderRadius: '12px',
                                    fontSize: '15px'
                                }}
                                onMouseEnter={e => {
                                    if (!interactionLoaded) e.currentTarget.style.filter = 'brightness(1.2)';
                                    else e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.filter = 'none';
                                    if (interactionLoaded) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                }}
                            >
                                {interactionLoaded ? '✓ Interaction Loaded' : '📂 Select Interaction File'}
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleSecondaryDataLoad}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    )}

                    <div style={stepContainerStyle('var(--accent-blue)')}>
                        <div style={{ color: 'white', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.02em' }}>Optional: Load Quest or Shop Data</div>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginTop: '8px', marginBottom: '20px' }}>
                            Import an existing <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>quest.json</span> or <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>shop.json</span>.
                        </p>
                        <label
                            style={{
                                ...btnSmallStyle,
                                background: 'var(--accent-blue)',
                                borderColor: 'var(--accent-blue)',
                                height: '46px',
                                padding: '0 24px',
                                borderRadius: '12px',
                                fontSize: '15px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                        >
                            📂 Select Quest/Shop File
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleThirdStepLoad}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                </div>
            )}

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
                                { id: 'QUEST', label: 'Quest Giver', icon: '📜', desc: 'Dialogue + Quest Configuration' },
                                { id: 'SHOP', label: 'Merchant', icon: '💰', desc: 'Dialogue + Shop Configuration' }
                            ].map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => handleInteractionTypeChange(opt.id)}
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
                                <label>Title (DisplayName & Window Title)</label>
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
                                    style={{ ...inputStyle, minHeight: '80px', padding: '12px 14px', lineHeight: '1.5' }}
                                />
                            </div>
                            {interactionType === 'QUEST' && (
                                <div>
                                    <label>Completed Text (After Quest)</label>
                                    <textarea
                                        value={dialogue.completedText}
                                        onChange={e => setDialogue({ ...dialogue, completedText: e.target.value })}
                                        style={{ ...inputStyle, minHeight: '60px', padding: '12px 14px', lineHeight: '1.5' }}
                                        placeholder="Text to show when the player has finished the quest..."
                                    />
                                </div>
                            )}

                            <div>
                                <label>Player Options</label>
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 2fr 1.5fr 45px', gap: '10px', marginBottom: '5px', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
                                        <div></div>
                                        <div>BUTTON TEXT</div>
                                        <div>ACTION TYPE</div>
                                        <div>TARGET ACTION</div>
                                        <div>CONDITION</div>
                                        <div></div>
                                    </div>
                                    {dialogue.options.map((opt, idx) => (
                                        <div
                                            key={idx}
                                            draggable
                                            onDragStart={(e) => {
                                                // Only allow drag if target is the handle
                                                if (!e.target.dataset.dragHandle) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                setDraggedIdx(idx);
                                                e.dataTransfer.effectAllowed = "move";
                                                const ghost = e.currentTarget.cloneNode(true);
                                                ghost.style.width = "200px";
                                                ghost.style.position = "absolute";
                                                ghost.style.top = "-1000px";
                                                document.body.appendChild(ghost);
                                                e.dataTransfer.setDragImage(ghost, 0, 0);
                                                setTimeout(() => document.body.removeChild(ghost), 0);
                                            }}
                                            onDragEnd={() => {
                                                setDraggedIdx(null);
                                                setDraggedOverIdx(null);
                                            }}
                                            onDragEnter={(e) => {
                                                e.preventDefault();
                                                setDraggedOverIdx(idx);
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setDraggedOverIdx(idx);
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                if (draggedIdx === null || draggedIdx === idx) return;

                                                const newOptions = [...dialogue.options];
                                                const [movedItem] = newOptions.splice(draggedIdx, 1);
                                                newOptions.splice(idx, 0, movedItem);

                                                setDialogue(prev => ({ ...prev, options: newOptions }));
                                                setDraggedIdx(null);
                                                setDraggedOverIdx(null);
                                            }}
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '30px minmax(150px, 1.5fr) minmax(130px, 1fr) minmax(200px, 2fr) minmax(150px, 1.5fr) 45px',
                                                gap: '10px',
                                                marginBottom: '10px',
                                                padding: '10px',
                                                background: draggedIdx === idx ? 'rgba(255,255,255,0.02)' : (draggedOverIdx === idx ? 'rgba(0, 150, 255, 0.1)' : 'transparent'),
                                                border: draggedOverIdx === idx ? '1px solid var(--accent-blue)' : '1px solid transparent',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                        >
                                            <div
                                                data-drag-handle="true"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'grab',
                                                    color: '#444',
                                                    fontSize: '18px',
                                                    userSelect: 'none',
                                                    padding: '5px'
                                                }}>
                                                ⣿
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <small style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Button Text</small>
                                                <input
                                                    placeholder="e.g. Talk to him"
                                                    value={opt.text}
                                                    onChange={e => updateOption(idx, 'text', e.target.value)}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <small style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Action Type</small>
                                                <select
                                                    value={opt.actionType}
                                                    onChange={e => updateOption(idx, 'actionType', e.target.value)}
                                                    style={inputStyle}
                                                >
                                                    <option value="NONE">close (Exit)</option>
                                                    <option value="DIALOG">DIALOG</option>
                                                    <option value="QUEST">ACCEPT_QUEST</option>
                                                    <option value="CHECK_QUEST">CHECK_QUEST</option>
                                                    <option value="SHOP">OPEN_SHOP</option>
                                                    <option value="HIDE_IF_COMPLETED">HIDE_IF_COMPLETED</option>
                                                    <option value="SHOW_IF_COMPLETED">SHOW_IF_COMPLETED</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <small style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Target Action (Manual ID)</small>
                                                <div style={{ height: '42px' }}>
                                                    <input
                                                        placeholder="e.g. OPEN_SHOP:myshop"
                                                        value={opt.action || ''}
                                                        onChange={e => updateOption(idx, 'action', sanitizeItemId(e.target.value))}
                                                        style={inputStyle}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <small style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Show Only If Completed</small>
                                                <input
                                                    placeholder="Quest ID to gate this option"
                                                    value={opt.requiredQuestId || ''}
                                                    onChange={e => updateOption(idx, 'requiredQuestId', sanitizeItemId(e.target.value))}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                                                <button onClick={async () => {
                                                    if (await showConfirm('Are you sure you want to remove this option?', 'Remove Option', { isDestructive: true, confirmText: 'Remove' })) {
                                                        const newOptions = dialogue.options.filter((_, i) => i !== idx);
                                                        setDialogue({ ...dialogue, options: newOptions });
                                                    }
                                                }} style={{ ...deleteBtnStyle, marginTop: '22px' }}>×</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={addOption} className="btn-secondary" style={btnSmallStyle}>+ Add Option</button>
                            </div>
                        </div>
                    </div>


                    {/* Conditional Editors */}
                    {
                        interactionType === 'QUEST' && quest && (
                            <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid var(--accent-yellow)' }}>
                                <h3 style={{ marginTop: 0, color: 'var(--accent-yellow)' }}>Quest Configuration</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quest ID will be: {npcId.toLowerCase()}_quest</p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                    <div>
                                        <label>Quest Title</label>
                                        <input
                                            value={quest.title}
                                            onChange={e => setQuest({ ...quest, title: e.target.value })}
                                            style={inputStyle}
                                            placeholder="e.g. A New Hero"
                                        />
                                    </div>
                                    <div>
                                        <label>Prerequisite Quest (Chain)</label>
                                        <input
                                            value={quest.requiredQuestId}
                                            onChange={e => setQuest({ ...quest, requiredQuestId: sanitizeItemId(e.target.value) })}
                                            style={inputStyle}
                                            placeholder="e.g. guide_npc_quest"
                                        />
                                        <small style={{ color: 'var(--text-muted)' }}>Quest that must be completed before this one can be accepted.</small>
                                    </div>
                                </div>
                                <label>Description</label>
                                <textarea
                                    value={quest.description}
                                    onChange={e => setQuest({ ...quest, description: e.target.value })}
                                    style={{ ...inputStyle, minHeight: '60px', padding: '12px 14px', lineHeight: '1.5' }}
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
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr 0.8fr 45px', gap: '10px', marginBottom: '5px', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
                                        <div>TYPE</div>
                                        <div>TARGET (ID)</div>
                                        <div>AMOUNT</div>
                                        <div></div>
                                    </div>
                                    {quest.objectives.map((obj, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr 0.8fr 45px', gap: '10px', marginBottom: '8px' }}>
                                            <select
                                                value={obj.type}
                                                onChange={e => {
                                                    const newObjs = [...quest.objectives];
                                                    newObjs[i].type = e.target.value;
                                                    setQuest({ ...quest, objectives: newObjs });
                                                }}
                                                style={{ ...inputStyle, marginBottom: 0 }}
                                            >
                                                <option value="COLLECT">Collect</option>
                                                <option value="KILL">Kill</option>
                                            </select>
                                            <div style={{ width: '100%', height: '42px' }}>
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
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                value={obj.amount}
                                                onChange={e => {
                                                    const newObjs = [...quest.objectives];
                                                    newObjs[i].amount = parseInt(e.target.value) || 1;
                                                    setQuest({ ...quest, objectives: newObjs });
                                                }}
                                                style={{ ...inputStyle, marginBottom: 0 }}
                                            />
                                            <button onClick={async () => {
                                                if (await showConfirm('Remove this objective?', 'Remove Objective', { isDestructive: true, confirmText: 'Remove' })) {
                                                    const newObjs = quest.objectives.filter((_, idx) => idx !== i);
                                                    setQuest({ ...quest, objectives: newObjs });
                                                }
                                            }} style={deleteBtnStyle}>×</button>
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
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr 0.8fr 45px', gap: '10px', marginBottom: '5px', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
                                        <div>TYPE</div>
                                        <div>REWARD</div>
                                        <div>AMOUNT</div>
                                        <div></div>
                                    </div>
                                    {quest.rewards.map((rew, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr 0.8fr 45px', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                                            <select
                                                value={rew.type}
                                                onChange={e => {
                                                    const newRews = [...quest.rewards];
                                                    newRews[i].type = e.target.value;
                                                    if (e.target.value === 'ITEM') newRews[i].id = '';
                                                    setQuest({ ...quest, rewards: newRews });
                                                }}
                                                style={{ ...inputStyle, marginBottom: 0 }}
                                            >
                                                <option value="MONEY">Money</option>
                                                <option value="ITEM">Item</option>
                                            </select>
                                            {rew.type === 'ITEM' ? (
                                                <div style={{ width: '100%', height: '42px' }}>
                                                    <ItemSearchInput
                                                        placeholder="Item ID"
                                                        value={rew.id}
                                                        availableItems={availableItems}
                                                        inputStyle={inputStyle}
                                                        onChange={val => {
                                                            const newRews = [...quest.rewards];
                                                            newRews[i].id = val;
                                                            setQuest({ ...quest, rewards: newRews });
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ ...inputStyle, background: 'transparent', border: '1px dashed #333', display: 'flex', alignItems: 'center', color: '#555', marginBottom: 0 }}>
                                                    N/A (Money only)
                                                </div>
                                            )}
                                            <input
                                                type="number"
                                                placeholder="100"
                                                value={rew.amount}
                                                onChange={e => {
                                                    const newRews = [...quest.rewards];
                                                    newRews[i].amount = parseInt(e.target.value) || 0;
                                                    setQuest({ ...quest, rewards: newRews });
                                                }}
                                                style={{ ...inputStyle, marginBottom: 0 }}
                                            />
                                            <button onClick={async () => {
                                                if (await showConfirm('Remove this reward?', 'Remove Reward', { isDestructive: true, confirmText: 'Remove' })) {
                                                    const newRews = quest.rewards.filter((_, idx) => idx !== i);
                                                    setQuest({ ...quest, rewards: newRews });
                                                }
                                            }} style={deleteBtnStyle}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    {
                        interactionType === 'SHOP' && shop && (
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
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.5fr 1fr 45px', gap: '8px', marginBottom: '5px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        <div>Item ID</div>
                                        <div>Qty</div>
                                        <div>Price (Gold)</div>
                                        <div></div>
                                    </div>
                                    {shop.items.map((item, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.5fr 1fr 45px', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ width: '100%', height: '42px' }}>
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
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="1"
                                                value={item.amount}
                                                onChange={e => {
                                                    const newItems = [...shop.items];
                                                    newItems[i].amount = parseInt(e.target.value) || 1;
                                                    setShop({ ...shop, items: newItems });
                                                }}
                                                style={{ ...inputStyle, marginBottom: 0 }}
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
                                                style={{ ...inputStyle, marginBottom: 0 }}
                                            />
                                            <button onClick={async () => {
                                                if (await showConfirm('Remove this item from the shop?', 'Remove Shop Item', { isDestructive: true, confirmText: 'Remove' })) {
                                                    const newItems = shop.items.filter((_, idx) => idx !== i);
                                                    setShop({ ...shop, items: newItems });
                                                }
                                            }} style={deleteBtnStyle}>×</button>
                                        </div>
                                    ))}
                                    <button onClick={() => setShop({
                                        ...shop,
                                        items: [...shop.items, { id: '', amount: 1, buyPrice: 10, sellPrice: 5 }]
                                    })} style={btnSmallStyle}>+ Add Item</button>
                                </div>

                            </div>
                        )
                    }

                    <button onClick={generateZip} className="btn-primary" style={{ width: '100%', padding: '15px' }}>
                        Generate Interaction Pack
                    </button>
                </>
            )
            }
        </div >
    );
}

const inputStyle = {
    width: '100%',
    height: '42px',
    padding: '0 16px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#e0e0e0',
    fontSize: '14px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    marginTop: '4px',
    marginBottom: '0',
    boxSizing: 'border-box'
};

const btnSmallStyle = {
    height: '40px',
    padding: '0 20px',
    fontSize: '14px',
    fontWeight: '600',
    background: 'linear-gradient(145deg, #2a2a2a, #222)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
};

const deleteBtnStyle = {
    ...btnSmallStyle,
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.2)',
    color: '#ff4444',
    width: '42px',
    height: '42px',
    padding: '0',
    fontSize: '18px',
    marginTop: '4px',
    borderRadius: '12px'
};

const stepContainerStyle = (color = 'var(--accent-blue)') => ({
    marginBottom: '30px',
    padding: '28px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderLeft: `4px solid ${color}`,
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    position: 'relative',
    overflow: 'hidden'
});
