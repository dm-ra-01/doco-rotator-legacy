import React from 'react';
import Layout from '@theme/Layout';
import KnowledgeGraph from '@site/src/components/KnowledgeGraph';

export default function KnowledgeGraphPage() {
    return (
        <Layout
            title="Knowledge Map"
            description="Interactive visual map of all Receptor documentation and their relationships.">
            <KnowledgeGraph />
        </Layout>
    );
}
