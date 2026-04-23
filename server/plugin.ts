/**
 * InterviewForge Vite 插件
 * 
 * 提供：
 * - GET /api/quiz — 返回当前会话的题库 JSON
 * - POST /api/finish — 接收答题数据，写文件，然后 process.exit(0)
 * 
 * 启动参数通过环境变量传递：
 * - QUIZ_FILE: 题库 JSON 路径（绝对路径）
 * - SESSION_ID: WorkBuddy 会话 ID
 * - RESULT_DIR: 结果输出目录（绝对路径）
 */
import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'

export function interviewForgePlugin(): Plugin {
  return {
    name: 'interview-forge-api',
    configureServer(server) {
      const quizFile = process.env.QUIZ_FILE || ''
      const sessionId = process.env.SESSION_ID || 'local-dev'
      const resultDir = process.env.RESULT_DIR || resolve(process.cwd(), 'data')

      console.log(`\n[interview-forge] 环境变量诊断:`)
      console.log(`  QUIZ_FILE  = "${quizFile}"`)
      console.log(`  SESSION_ID = "${sessionId}"`)
      console.log(`  RESULT_DIR = "${resultDir}"`)
      console.log(`  文件存在   = ${quizFile ? existsSync(quizFile) : 'N/A (未设置)'}\n`)

      /** 读取题库 JSON 并注入 _sessionId */
      function loadAndInjectQuiz(filePath: string, res: any) {
        try {
          const data = readFileSync(filePath, 'utf-8')
          const json = JSON.parse(data)
          json._sessionId = sessionId
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify(json))
        } catch (e: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: '读取题库失败: ' + e.message }))
        }
      }

      // GET /api/quiz — 返回题库
      server.middlewares.use('/api/quiz', (_req, res) => {
        if (!quizFile || !existsSync(quizFile)) {
          // 开发模式：返回 sample.json
          const fallback = resolve(process.cwd(), 'data', 'sample.json')
          if (existsSync(fallback)) {
            loadAndInjectQuiz(fallback, res)
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.statusCode = 404
          res.end(JSON.stringify({ error: '题库文件不存在' }))
          return
        }

        loadAndInjectQuiz(quizFile, res)
      })

      // POST /api/finish — 接收结果并退出
      server.middlewares.use('/api/finish', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const result = JSON.parse(body)

            // 写结果文件
            const resultFile = resolve(resultDir, `result-${sessionId}.json`)
            writeFileSync(resultFile, JSON.stringify(result, null, 2), 'utf-8')

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, resultFile }))

            console.log(`\n✅ 答题结果已保存: ${resultFile}`)

            // 延迟退出，让响应先发出去
            setTimeout(() => {
              console.log('👋 InterviewForge 进程退出')
              process.exit(0)
            }, 500)
          } catch (e: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: '保存结果失败: ' + e.message }))
          }
        })
      })
    },
  }
}
