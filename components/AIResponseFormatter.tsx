"use client"

import React from "react"

interface AIResponseFormatterProps {
  content: string
}

export function AIResponseFormatter({ content }: AIResponseFormatterProps) {
  // Parse the AI response to format it better
  const formatResponse = (text: string) => {
    // Split by emoji sections to create better structure
    const sections = text.split(/(?=🔍|🧠|💡|💚)/).filter(section => section.trim())
    
    if (sections.length <= 1) {
      // If no emoji sections found, return as is with better formatting
      return (
        <div className="space-y-3">
          {text.split('\n\n').map((paragraph, index) => (
            <p key={index} className="leading-relaxed">
              {paragraph.trim()}
            </p>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          const trimmedSection = section.trim()
          if (!trimmedSection) return null

          // Extract emoji and title
          const lines = trimmedSection.split('\n')
          const titleLine = lines[0]
          const content = lines.slice(1).join('\n').trim()

          // Determine section styling based on emoji
          let sectionClass = "border-l-4 pl-4 py-2"
          if (titleLine.includes('🔍')) {
            sectionClass += " border-blue-400 bg-blue-50"
          } else if (titleLine.includes('🧠')) {
            sectionClass += " border-purple-400 bg-purple-50"
          } else if (titleLine.includes('💡')) {
            sectionClass += " border-amber-400 bg-amber-50"
          } else if (titleLine.includes('💚')) {
            sectionClass += " border-green-400 bg-green-50"
          } else {
            sectionClass += " border-gray-300 bg-gray-50"
          }

          return (
            <div key={index} className={sectionClass}>
              <div className="font-semibold text-gray-800 mb-2">
                {titleLine}
              </div>
              <div className="text-gray-700 leading-relaxed">
                {content.split('\n').map((line, lineIndex) => {
                  if (line.trim().startsWith('•')) {
                    return (
                      <div key={lineIndex} className="flex items-start gap-2 mb-1">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{line.replace('•', '').trim()}</span>
                      </div>
                    )
                  }
                  return line.trim() ? (
                    <p key={lineIndex} className="mb-2">
                      {line}
                    </p>
                  ) : null
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return <div className="ai-response">{formatResponse(content)}</div>
}

export default AIResponseFormatter
