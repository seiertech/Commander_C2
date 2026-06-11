'use client';

import type { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { useMode } from '@/context/mode-context';
import { PageContainer } from '@/components/page-container';
import { componentTokens } from '../../../../../packages/ui/src/tokens/components';
import { primitiveTypeScale, primitiveSpacing, primitiveFontWeight, primitiveFonts, primitiveLetterSpacing, primitiveSignal } from '../../../../../packages/ui/src/tokens/primitives';
import { ReactFlow, Background, Controls, Node, Edge, Position } from '@xyflow/react';
import { useMemo, useState } from 'react';

import '@xyflow/react/dist/style.css';
import { thesisTopology, thesisAssets, thesisBlastRadius, thesisCases, thesisRiskObjects, thesisArchitectureIntelligence, thesisExposures, thesisPostures, thesisStrategies, thesisMissions, thesisConnectors, thesisRiskScores, thesisActions, thesisIdentities, thesisEvents, thesisSignals, thesisIocs } from '../../../../../packages/contracts/src/fixtures/thesis-adapters';

/**
 * Fusion Map — Relationship Graph
 * Data: TopologySnapshot nodes/edges from seed-topology
 * Route: /fusion-map | Status: BUILD
 */
{/* AI-PLACEMENT: AICAP-FUSION-001 — Commander AI relationship insight */}

export default function FusionMapPage() {
  const { mode, tokens } = useMode();
  const { nodes, edges, blastRadiusResults } = thesisTopology;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // KPI calculations
  const criticalNodes = nodes.filter((n) => n.criticality <= 2).length;
  const uniqueTypes = new Set(nodes.map((n) => n.entity_type)).size;
  const maxBlastRadius = blastRadiusResults.reduce((max, br) => Math.max(max, br.total_impact_score), 0);
  const avgWeight = edges.reduce((sum, e) => sum + e.weight, 0) / edges.length;

  // Create lookup map for node resolution
  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach(node => map.set(node.node_id, node));
    return map;
  }, [nodes]);

  // Transform data for React Flow network graph
  const flowNodes: Node[] = useMemo(() => {
    return nodes.map((node, index) => ({
      id: node.node_id,
      data: { 
        label: node.label,
        entity_type: node.entity_type,
        domain: node.domain,
        criticality: node.criticality
      },
      position: { 
        x: (index % 3) * 200 + 100, 
        y: Math.floor(index / 3) * 150 + 50 
      },
      style: {
        background: node.criticality <= 2 ? primitiveSignal.critical : tokens.surface.elevated,
        color: tokens.text.primary,
        border: `2px solid ${tokens.border.default}`,
        borderRadius: '4px',
        padding: primitiveSpacing[2],
        fontSize: primitiveTypeScale.micro,
        fontWeight: primitiveFontWeight.semibold
      }
    }));
  }, [nodes, tokens]);

  const flowEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => ({
      id: edge.edge_id,
      source: edge.source_node_id,
      target: edge.target_node_id,
      label: edge.relationship_type.replace(/_/g, ' '),
      style: {
        strokeWidth: Math.max(1, edge.weight * 4),
        stroke: tokens.border.default
      },
      labelStyle: {
        fontSize: primitiveTypeScale.micro,
        color: tokens.text.muted
      }
    }));
  }, [edges, tokens]);

  // Fixed Sankey data - correct Recharts format
  const sankeyData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    
    // Add all unique node labels from actual data
    const nodeSet = new Set();
    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source_node_id);
      const targetNode = nodeMap.get(edge.target_node_id);
      if (sourceNode) nodeSet.add(sourceNode.label);
      if (targetNode) nodeSet.add(targetNode.label);
    });
    
    // Convert to nodes array
    const nodeArray = Array.from(nodeSet);
    nodeArray.forEach(label => nodes.push({ name: label }));
    
    // Add links with correct indices
    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source_node_id);
      const targetNode = nodeMap.get(edge.target_node_id);
      if (sourceNode && targetNode) {
        const sourceIndex = nodeArray.indexOf(sourceNode.label);
        const targetIndex = nodeArray.indexOf(targetNode.label);
        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
          links.push({
            source: sourceIndex,
            target: targetIndex,
            value: Math.round(edge.weight * 100)
          });
        }
      }
    });

    return { nodes, links };
  }, [edges, nodeMap]);

  // Selected node blast radius
  const selectedBlastRadius = selectedNodeId 
    ? blastRadiusResults.find(br => br.origin_node_id === selectedNodeId)
    : blastRadiusResults[0]; // Default to first result

  return (
    <PageContainer pretitle="Fusion Map" title="Relationship Graph">
      {/* Enhanced KPI Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        <Kpi tokens={tokens} label="Nodes" value={String(nodes.length)} />
        <Kpi tokens={tokens} label="Edges" value={String(edges.length)} />
        <Kpi tokens={tokens} label="Critical Nodes" value={String(criticalNodes)} accent={primitiveSignal.warning} />
        <Kpi tokens={tokens} label="Entity Types" value={String(uniqueTypes)} />
        <Kpi tokens={tokens} label="Max Blast Impact" value={String(maxBlastRadius)} accent={primitiveSignal.critical} />
        <Kpi tokens={tokens} label="Avg Weight" value={avgWeight.toFixed(2)} />
      </section>

      {/* Visualization Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: componentTokens.gridGap, marginBottom: componentTokens.gridGap }}>
        {/* Network Graph Card */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Network Graph</h3>
          <div style={{ height: '400px', border: `1px solid ${tokens.border.subtle}` }}>
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              fitView
            >
              <Background color={tokens.border.subtle} />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        {/* Blast Radius Card */}
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>
            Blast Radius {selectedBlastRadius && `(${nodeMap.get(selectedBlastRadius.origin_node_id)?.label || selectedBlastRadius.origin_node_id})`}
          </h3>
          {selectedBlastRadius && (
            <div style={{ display: 'grid', gap: primitiveSpacing[3] }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: primitiveSpacing[2] }}>
                <Kpi tokens={tokens} label="Affected" value={String(selectedBlastRadius.affected_nodes.length)} accent={primitiveSignal.warning} />
                <Kpi tokens={tokens} label="Depth" value={String(selectedBlastRadius.depth)} />
              </div>
              <Kpi tokens={tokens} label="Impact Score" value={String(selectedBlastRadius.total_impact_score)} accent={primitiveSignal.critical} />
              <div>
                <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.muted, margin: `0 0 ${primitiveSpacing[2]}`, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>Affected Nodes</h4>
                <div style={{ display: 'grid', gap: primitiveSpacing[1] }}>
                  {selectedBlastRadius.affected_nodes.map(nodeId => {
                    const node = nodeMap.get(nodeId);
                    return (
                      <div key={nodeId} style={{ 
                        fontSize: primitiveTypeScale.micro, 
                        color: tokens.text.secondary,
                        padding: primitiveSpacing[1],
                        background: tokens.surface.primary,
                        border: `1px solid ${tokens.border.subtle}`
                      }}>
                        {node?.label || nodeId}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Domain Relationship Flow - Sankey + Summary */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Domain Relationship Flow</h3>
        
      {/* Domain Flow Summary - Table Format */}
      <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding, marginBottom: componentTokens.gridGap }}>
        <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Domain Relationship Flow</h3>
        <div style={{ height: '200px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
            <thead>
              <tr style={{ background: tokens.surface.primary }}>
                {['Source', 'Target', 'Relationship', 'Weight'].map((h) => (
                  <th key={h} style={{ 
                    textAlign: 'left', 
                    padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, 
                    borderBottom: `2px solid ${tokens.border.default}`, 
                    color: tokens.text.muted, 
                    fontWeight: primitiveFontWeight.semibold, 
                    textTransform: 'uppercase', 
                    letterSpacing: primitiveLetterSpacing.eyebrow, 
                    fontSize: primitiveTypeScale.micro 
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {edges.map((edge) => {
                const sourceNode = nodeMap.get(edge.source_node_id);
                const targetNode = nodeMap.get(edge.target_node_id);
                return (
                  <tr key={edge.edge_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ 
                      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, 
                      color: tokens.text.primary,
                      fontWeight: primitiveFontWeight.semibold,
                      fontSize: primitiveTypeScale.caption
                    }}>
                      {sourceNode?.label || 'Unknown'}
                    </td>
                    <td style={{ 
                      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, 
                      color: tokens.text.primary,
                      fontWeight: primitiveFontWeight.semibold,
                      fontSize: primitiveTypeScale.caption
                    }}>
                      {targetNode?.label || 'Unknown'}
                    </td>
                    <td style={{ 
                      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, 
                      color: tokens.text.secondary,
                      fontSize: primitiveTypeScale.caption
                    }}>
                      {edge.relationship_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ 
                      padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, 
                      fontFamily: primitiveFonts.mono,
                      color: tokens.text.secondary,
                      fontSize: primitiveTypeScale.caption,
                      display: 'flex',
                      alignItems: 'center',
                      gap: primitiveSpacing[2]
                    }}>
                      <div style={{
                        width: `${Math.max(20, edge.weight * 60)}px`,
                        height: '8px',
                        backgroundColor: primitiveSignal.info,
                        borderRadius: '4px'
                      }} />
                      {edge.weight.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

        {/* Flow Summary Table */}
        <div style={{ maxHeight: '200px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.micro }}>
            <thead>
              <tr style={{ background: tokens.surface.primary }}>
                {['Source', 'Relationship', 'Target', 'Weight'].map((h) => (
                  <th key={h} style={{ 
                    textAlign: 'left', 
                    padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, 
                    borderBottom: `1px solid ${tokens.border.default}`, 
                    color: tokens.text.muted, 
                    fontWeight: primitiveFontWeight.semibold, 
                    fontSize: primitiveTypeScale.micro
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {edges.slice(0, 6).map((edge) => {
                const sourceNode = nodeMap.get(edge.source_node_id);
                const targetNode = nodeMap.get(edge.target_node_id);
                return (
                  <tr key={edge.edge_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                    <td style={{ 
                      padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, 
                      color: tokens.text.secondary,
                      fontSize: primitiveTypeScale.micro
                    }}>
                      {sourceNode?.domain || '?'}
                    </td>
                    <td style={{ 
                      padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, 
                      color: tokens.text.muted,
                      fontSize: primitiveTypeScale.micro
                    }}>
                      {edge.relationship_type.replace(/_/g, ' ')}
                    </td>
                    <td style={{ 
                      padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, 
                      color: tokens.text.secondary,
                      fontSize: primitiveTypeScale.micro
                    }}>
                      {targetNode?.domain || '?'}
                    </td>
                    <td style={{ 
                      padding: `${primitiveSpacing[1]} ${primitiveSpacing[2]}`, 
                      fontFamily: primitiveFonts.mono,
                      color: tokens.text.secondary,
                      fontSize: primitiveTypeScale.micro
                    }}>
                      {edge.weight.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {edges.length > 6 && (
            <div style={{ 
              padding: primitiveSpacing[2], 
              textAlign: 'center', 
              color: tokens.text.muted, 
              fontSize: primitiveTypeScale.micro 
            }}>
              +{edges.length - 6} more relationships
            </div>
          )}
        </div>
      </div>

      {/* Evidence Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Topology Nodes (Evidence)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Label', 'Type', 'Domain', 'Criticality'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
              <tbody>{nodes.map((n) => (
                <tr key={n.node_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}`, backgroundColor: selectedNodeId === n.node_id ? tokens.surface.primary : 'transparent' }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary, fontWeight: primitiveFontWeight.semibold, cursor: 'pointer' }} onClick={() => setSelectedNodeId(n.node_id)}>{n.label}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary }}>{n.entity_type}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.muted }}>{n.domain}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono, color: n.criticality <= 2 ? primitiveSignal.critical : tokens.text.secondary }}>{n.criticality}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Relationships (Evidence)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: primitiveTypeScale.caption }}>
              <thead><tr>{['Source', 'Target', 'Type', 'Weight'].map((h) => <th key={h} style={{ textAlign: 'left', padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, borderBottom: `2px solid ${tokens.border.default}`, color: tokens.text.muted, fontWeight: primitiveFontWeight.semibold, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow, fontSize: primitiveTypeScale.micro }}>{h}</th>)}</tr></thead>
              <tbody>{edges.map((e) => (
                <tr key={e.edge_id} style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{nodeMap.get(e.source_node_id)?.label || e.source_node_id}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.secondary, fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro }}>{nodeMap.get(e.target_node_id)?.label || e.target_node_id}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, color: tokens.text.primary }}>{e.relationship_type.replace(/_/g, ' ')}</td>
                  <td style={{ padding: `${primitiveSpacing[2]} ${primitiveSpacing[3]}`, fontFamily: primitiveFonts.mono }}>{e.weight}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    

      {/* Cross-Entity: Fusion Map → Blast Radius + Cases */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Blast Radius ({thesisBlastRadius.length})</h3>
          {thesisBlastRadius.map((b) => (
            <div key={b.id} style={{ padding: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: primitiveFonts.mono, fontSize: primitiveTypeScale.micro, color: tokens.text.primary }}>{b.originEntityRef?.slice(0,16)} ({b.originEntityType})</span>
              <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: b.total_impact_score > 50 ? primitiveSignal.critical : primitiveSignal.warning }}>{b.total_impact_score} → {b.affected_entities.length} entities</span>
            </div>
          ))}
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h3 style={{ fontSize: primitiveTypeScale.h4, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: `0 0 ${componentTokens.cardHeaderMargin}` }}>Architecture Intelligence ({thesisArchitectureIntelligence.length})</h3>
          {thesisArchitectureIntelligence.map((ai) => (
            <div key={ai.id} style={{ padding: primitiveSpacing[2], borderBottom: `1px solid ${tokens.border.subtle}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: tokens.text.primary, fontSize: primitiveTypeScale.caption }}>{ai.name}</span>
              <span style={{ padding: '2px 6px', fontSize: primitiveTypeScale.micro, color: '#fff', background: ai.severity >= 7 ? primitiveSignal.critical : primitiveSignal.warning }}>{ai.severity}/10</span>
            </div>
          ))}
        </div>
      </div>
    
      {/* Engine Correlation Chart — Sweep 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: componentTokens.gridGap, marginTop: componentTokens.gridGap }}>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Risk Distribution</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Open', 'Mitigated', 'Closed'], colors: [primitiveSignal.warning, primitiveSignal.success, primitiveSignal.neutral], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisRiskObjects.filter((r) => r.treatment_state === 'open').length, thesisRiskObjects.filter((r) => r.treatment_state === 'mitigated').length, thesisRiskObjects.filter((r) => r.treatment_state !== 'open' && r.treatment_state !== 'mitigated').length]} />
        </div>
        <div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}>
          <h4 style={{ fontSize: primitiveTypeScale.caption, fontWeight: primitiveFontWeight.semibold, color: tokens.text.primary, margin: '0 0 8px' }}>Posture Health</h4>
          <Chart type="donut" height={200} options={{ chart: { type: 'donut', background: 'transparent' }, labels: ['Healthy', 'Degraded', 'Critical'], colors: [primitiveSignal.success, primitiveSignal.warning, primitiveSignal.critical], legend: { position: 'bottom', labels: { colors: tokens.text.secondary }, fontSize: '11px' }, dataLabels: { enabled: true }, theme: { mode: mode === 'mission' ? 'dark' : 'light' } }} series={[thesisPostures.filter((p) => p.posture_status === 'healthy').length, thesisPostures.filter((p) => p.posture_status === 'degraded').length, thesisPostures.filter((p) => p.posture_status === 'critical').length]} />
        </div>
      </div>
    </PageContainer>
  );
}

function Kpi({ tokens, label, value, accent }: { tokens: ReturnType<typeof useMode>['tokens']; label: string; value: string; accent?: string }) {
  return (<div style={{ background: tokens.surface.elevated, border: `1px solid ${tokens.border.default}`, padding: componentTokens.cardPadding }}><span style={{ display: 'block', fontSize: primitiveTypeScale.micro, color: tokens.text.muted, textTransform: 'uppercase', letterSpacing: primitiveLetterSpacing.eyebrow }}>{label}</span><span style={{ fontSize: primitiveTypeScale.kpiValue, fontFamily: primitiveFonts.mono, fontWeight: primitiveFontWeight.bold, color: accent ?? tokens.text.primary }}>{value}</span></div>);
}
