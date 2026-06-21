const { z } = require("zod");

const schemas = {
  auth: {
    register: z.object({
      body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    }),
    login: z.object({
      body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    }),
    updateProfile: z.object({
      body: z.object({
        name: z.string().min(2).optional(),
        phone: z.string().optional(),
      })
    }),
    changePassword: z.object({
      body: z.object({
        currentpassword: z.string().min(1, "Current password is required"),
        newpassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmpassword: z.string().min(6, "Password must be at least 6 characters"),
      })
    })
  },
  ai: {
    generateImage: z.object({
      body: z.object({
        prompt: z.string().min(1, "Prompt is required").max(1000, "Prompt is too long"),
        style: z.string().optional(),
        count: z.number().int().min(1).max(4).optional(),
        aspect: z.string().optional()
      })
    }),
    generateWebsite: z.object({
      body: z.object({
        prompt: z.string().min(1, "Prompt is required"),
        type: z.string().optional(),
        theme: z.string().optional(),
        font: z.string().optional()
      })
    }),
    generateCode: z.object({
      body: z.object({
        prompt: z.string().min(1, "Prompt is required")
      })
    }),
    youtubeSummary: z.object({
      body: z.object({
        url: z.string().url("Must be a valid URL")
      })
    }),
    chatbot: z.object({
      body: z.object({
        message: z.string().min(1, "Message is required")
      })
    }),
    startInterview: z.object({
      body: z.object({
        tech: z.string().min(1, "Tech is required")
      })
    }),
    submitAnswer: z.object({
      body: z.object({
        sessionId: z.string().min(1, "Session ID is required"),
        answer: z.string().min(1, "Answer is required")
      })
    }),
    endInterview: z.object({
      body: z.object({
        sessionId: z.string().min(1, "Session ID is required")
      })
    }),
    analyzeResume: z.object({
      body: z.object({
        prompt: z.string().optional()
      })
    })
  }
};

module.exports = schemas;
