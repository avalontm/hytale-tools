import React, { useState } from 'react';
import { useDialog } from '../contexts/DialogContext';
import JSZip from 'jszip';

export default function NPCGenerator() {
  const { showAlert } = useDialog();
  const [files, setFiles] = useState([]);
  const [npcName, setNpcName] = useState('');
  const [mainModelName, setMainModelName] = useState('');
  const [behaviorType, setBehaviorType] = useState('Passive');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);

  const handleFolderSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    if (selectedFiles.length > 0) {
      const firstPath = selectedFiles[0].webkitRelativePath;
      const pathParts = firstPath.split('/');
      const detectedName = pathParts[pathParts.length - 2] || pathParts[0];
      setNpcName(detectedName);
    }

    setStatus(`${selectedFiles.length} files loaded`);
  };

  const generateAssets = () => {
    if (files.length === 0) {
      showAlert('Please load some files first.', 'No Files');
      return;
    }

    if (!npcName.trim()) {
      showAlert('You must specify a name for the NPC.', 'Missing Name');
      return;
    }

    setStatus('Processing...');

    const allModels = files
      .filter(f => f.name.endsWith('.blockymodel'))
      .map(f => ({
        file: f.name,
        rel: f.webkitRelativePath,
        fullPath: f.webkitRelativePath,
        fileObj: f
      }));

    const allTextures = files
      .filter(f => f.name.endsWith('.png'))
      .map(f => ({
        file: f.name,
        rel: f.webkitRelativePath,
        fullPath: f.webkitRelativePath,
        fileObj: f
      }));

    if (allModels.length === 0) {
      showAlert('No .blockymodel files found in the selected folder.', 'Models Not Found');
      return;
    }

    let mainModel = null;

    if (mainModelName) {
      mainModel = allModels.find(m =>
        m.file.toLowerCase().includes(mainModelName.toLowerCase())
      );
    }

    if (!mainModel) {
      mainModel = allModels.find(m =>
        m.file.toLowerCase() === 'model.blockymodel' ||
        m.file.toLowerCase().includes(npcName.toLowerCase()) ||
        m.file.toLowerCase().includes('main')
      );
    }

    if (!mainModel) {
      mainModel = allModels[0];
    }

    const mainTexture = allTextures.find(t =>
      t.file.toLowerCase().includes(
        mainModel.file.replace('.blockymodel', '').toLowerCase()
      )
    ) || allTextures.find(t =>
      t.file.toLowerCase().includes('greyscale') ||
      t.file.toLowerCase().includes(npcName.toLowerCase())
    ) || allTextures[0] || { rel: '' };

    const attachments = allModels
      .filter(m => m !== mainModel)
      .map(m => {
        const modelNameClean = m.file.replace('.blockymodel', '').toLowerCase();
        const textureMatch = allTextures.find(t =>
          modelNameClean.includes(t.file.replace('.png', '').toLowerCase())
        );

        const item = {
          Model: m.rel,
          Texture: textureMatch ? textureMatch.rel : (mainTexture.rel || '')
        };

        const mLower = m.file.toLowerCase();

        if (['hair', 'greaser', 'beard'].some(x => mLower.includes(x))) {
          item.GradientSet = 'Hair';
          item.GradientId = 'Black';
        } else if (['ears', 'mouth', 'face', 'eyes'].some(x => mLower.includes(x))) {
          item.GradientSet = 'Skin';
          item.GradientId = '03';
        } else if (['tshirt', 'shirt', 'top', 'vneck', 'armor'].some(x => mLower.includes(x))) {
          item.GradientSet = 'Fantasy_Cotton';
          item.GradientId = 'Brown';
        } else if (['pants', 'shorts', 'leg', 'shorty'].some(x => mLower.includes(x))) {
          item.GradientSet = 'Jean_Generic';
          item.GradientId = 'Green';
        } else if (['boots', 'shoes', 'gloves'].some(x => mLower.includes(x))) {
          item.GradientSet = 'Fantasy_Cotton';
          item.GradientId = 'Brown';
        }

        return item;
      });

    const appearance = {
      Parent: 'Player',
      Model: mainModel.rel,
      Texture: mainTexture.rel || '',
      GradientSet: 'Skin',
      GradientId: '03',
      DefaultAttachments: attachments
    };

    let role = {
      Type: 'Variant',
      Reference: 'Template_Intelligent',
      Modify: {
        Appearance: npcName,
        Weapons: [],
        OffHand: []
      },
      Parameters: {
        Invulnerable: {
          Value: behaviorType === 'Interactive',
          Description: "Whether this NPC is invulnerable."
        },
        NameTranslationKey: {
          Value: `server.npcRoles.${npcName}.name`,
          Description: "Translation key for NPC name display"
        }
      },
      Invulnerable: { Compute: "Invulnerable" }
    };

    if (behaviorType === 'Aggressive') {
      role.Modify = {
        ...role.Modify,
        DefaultPlayerAttitude: 'Hostile',
        ViewSector: 250,
        HearingRange: 10,
        AttackDistance: 2.5,
        UseCombatActionEvaluator: true,
        MaxSpeed: 12,
        MaxHealth: 200
      };
    } else if (behaviorType === 'Neutral') {
      role.Modify = {
        ...role.Modify,
        DefaultPlayerAttitude: 'Neutral',
        MaxHealth: 150,
        MaxSpeed: 8
      };
    } else if (behaviorType === 'Passive') {
      role.Modify = {
        ...role.Modify,
        DefaultPlayerAttitude: 'Neutral',
        MaxHealth: 100,
        MaxSpeed: 6
      };
    } else if (behaviorType === 'Interactive') {
      // For Interactive, we use a slightly more Generic-like structure but as a Variant for simplicity
      role.Type = 'Generic';
      delete role.Reference;
      delete role.Modify;

      role = {
        ...role,
        StartState: "Idle",
        DefaultPlayerAttitude: "Neutral",
        Appearance: npcName,
        MaxHealth: 100,
        BusyStates: ["$Interaction"],
        NameTranslationKey: `server.npcRoles.${npcName}.name`,
        InteractionInstruction: {
          Instructions: [
            {
              Sensor: { Type: "HasInteracted" },
              Actions: [
                { Type: "LockOnInteractionTarget" },
                { Type: "OpenBarterShop", Shop: npcName },
                { Type: "State", State: "$Interaction" }
              ]
            }
          ]
        }
      };
    }

    setResults({
      appearance,
      role,
      mainModelPath: mainModel.rel,
      attachmentsCount: attachments.length
    });

    showAlert('NPC assets generated successfully!', 'Success');
    setStatus('');
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 4)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    if (!results) return;

    const zip = new JSZip();

    // Add Appearance JSON
    zip.file(`${npcName}.json`, JSON.stringify(results.appearance, null, 4));

    // Add Role JSON
    zip.file(`${npcName}_Role.json`, JSON.stringify(results.role, null, 4));

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${npcName}_assets.zip`;
      link.click();
      URL.revokeObjectURL(url);
      showAlert('Your files have been bundled into a ZIP and download has started.', 'Download Ready');
    } catch (err) {
      console.error(err);
      showAlert('There was an error generating the ZIP file.', 'Error');
    }
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      padding: '40px',
      border: '1px solid var(--border-color)',
      borderTop: '1px solid var(--border-highlight)',
      backdropFilter: 'blur(10px)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 10px 0',
          color: 'var(--text-highlight)',
          fontFamily: "'Lexend', sans-serif"
        }}>
          NPC Generator
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          margin: 0,
          fontSize: '16px'
        }}>
          Generate appearance and role files for Hytale NPCs using Blockbench models
        </p>
      </div>

      {/* Upload Area */}
      <div style={{
        border: '2px dashed var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '30px',
        background: 'var(--bg-primary)',
        transition: 'all 0.3s'
      }}>
        <input
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderSelect}
          style={{ display: 'none' }}
          id="folderInput"
        />
        <label
          htmlFor="folderInput"
          className="btn btn-primary"
          style={{
            padding: '14px 28px',
            fontSize: '15px'
          }}
        >
          Select NPC Folder
        </label>
        <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
          {files.length > 0
            ? `✓ ${files.length} files loaded`
            : 'Select the Models folder containing Model.blockymodel and textures'}
        </p>
      </div>

      {/* Form Fields */}
      <div style={{
        display: 'grid',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            NPC Name
          </label>
          <input
            type="text"
            value={npcName}
            onChange={(e) => setNpcName(e.target.value)}
            placeholder="Ex: Guardian, Merchant, etc."
            style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '15px',
              color: 'white',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(102,126,234,0.5)';
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '14px'
          }}>
            Main model (e.g., Model.blockymodel)
          </label>
          <input
            type="text"
            value={mainModelName}
            onChange={(e) => setMainModelName(e.target.value)}
            placeholder="Name of the base .blockymodel file"
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '15px',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-blue)';
              e.target.style.boxShadow = '0 0 0 2px rgba(0, 150, 255, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '5px', display: 'block' }}>
            If empty, it will be detected automatically
          </small>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Behavior Type
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Passive', 'Neutral', 'Aggressive', 'Interactive'].map(type => (
              <button
                key={type}
                onClick={() => setBehaviorType(type)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: behaviorType === type ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${behaviorType === type ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  borderRadius: '10px',
                  color: behaviorType === type ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <small style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '10px', display: 'block' }}>
            {behaviorType === 'Aggressive' && 'Attacks players on sight. High speed and health.'}
            {behaviorType === 'Neutral' && 'Peaceful unless attacked. Balanced stats.'}
            {behaviorType === 'Passive' && 'Standard friendly NPC. Low health.'}
            {behaviorType === 'Interactive' && 'Merchant/Social NPC. Supports shop and interaction logic.'}
          </small>
        </div>


      </div>

      {/* Generate Button */}
      <button
        onClick={generateAssets}
        disabled={files.length === 0}
        className={`btn ${files.length === 0 ? '' : 'btn-primary'}`}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        Generate Assets
      </button>

      {/* Status Message */}
      {status && (
        <div style={{
          padding: '16px',
          background: 'rgba(0, 150, 255, 0.1)',
          border: '1px solid var(--accent-blue)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          color: 'var(--accent-blue)',
          fontSize: '14px'
        }}>
          {status}
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{
          background: 'rgba(102,126,234,0.08)',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid rgba(102,126,234,0.2)'
        }}>
          <h3 style={{ marginTop: 0, color: 'white', fontSize: '20px', fontWeight: '600' }}>
            Results
          </h3>
          <div style={{ marginBottom: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: 'white' }}>Base Model:</strong> {results.mainModelPath}
            </p>
            <p style={{ margin: '8px 0' }}>
              <strong style={{ color: 'white' }}>Parts Found:</strong> {results.attachmentsCount}
            </p>
          </div>

          <button
            onClick={downloadAll}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              background: 'var(--accent-green)',
              fontSize: '15px'
            }}
          >
            Download JSON Files
          </button>

          <details style={{ marginTop: '25px' }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '14px'
            }}>
              View Appearance JSON
            </summary>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.5'
            }}>
              {JSON.stringify(results.appearance, null, 2)}
            </pre>
          </details>

          <details style={{ marginTop: '15px' }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '14px'
            }}>
              View Role JSON
            </summary>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: '1.5'
            }}>
              {JSON.stringify(results.role, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
