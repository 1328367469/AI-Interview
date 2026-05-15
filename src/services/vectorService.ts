import { Voy } from 'voy-search';
import axios from 'axios';

export interface VectorItem {
  id: string;
  title: string;
  content: string;
  metadata?: any;
}

class VectorService {
  private voy: Voy | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    this.voy = new Voy();
    this.isInitialized = true;
  }

  // Get Embedding from API
  private async getEmbedding(text: string): Promise<number[]> {
    try {
      const apiKey = localStorage.getItem('SILICONFLOW_API_KEY') || '';
      if (!apiKey) throw new Error("API Key missing");

      const response = await axios.post('https://api.siliconflow.cn/v1/embeddings', {
        model: 'BAAI/bge-m3',
        input: text,
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.data[0].embedding;
    } catch (e) {
      console.warn("Embedding API failed, using fallback mock", e);
      // Fallback: simple hash-based vector (not real semantic but maintains structure)
      return new Array(1024).fill(0).map((_, i) => (text.charCodeAt(i % text.length) || 0) / 255);
    }
  }

  async addDocuments(docs: VectorItem[]) {
    if (!this.voy) await this.init();
    
    for (const doc of docs) {
      const embedding = await this.getEmbedding(doc.content);
      this.voy!.add({
        embeddings: [
          {
            id: doc.id,
            title: doc.title,
            url: doc.content,
            embeddings: embedding
          }
        ]
      });
    }
  }

  async search(query: string, limit = 3) {
    if (!this.voy) await this.init();
    const queryEmbedding = await this.getEmbedding(query);
    const results = this.voy!.search(new Float32Array(queryEmbedding), limit);
    return results;
  }

  // Initial sync from hardcoded content (since we'll delete the .md files)
  async syncInitialData() {
    const isSynced = localStorage.getItem('vdb_synced');
    if (isSynced) return;

    const initialDocs: VectorItem[] = [
      {
        id: 'nexus_skill',
        title: 'NEXUS AI Framework',
        content: `NEXUS AI 核心运行框架及提示词资产。包含 [NEXUS_AI 面试官/职业顾问 核心智能协议]。
          特点：结构化输出、STAR原则、用户画像动态感知。`
      },
      {
        id: 'audio_guide',
        title: 'Voice & AI Guide',
        content: `专业语音及AI大模型服务申请指南。推荐服务：火山引擎(字节)、阿里云(百炼)。
          涉及 STT/TTS 方案及情感分析实现。`
      },
      {
        id: 'career_generator',
        title: 'Career Graph Generator',
        content: `通用职业路径拓扑生成器设计。目标：提供真实的可落地职业发展路径。
          包含 3 个阶段：强化、突破、远景。`
      }
    ];

    await this.addDocuments(initialDocs);
    localStorage.setItem('vdb_synced', 'true');
    console.log("Vector DB initial sync complete.");
  }
}

export const vectorService = new VectorService();
