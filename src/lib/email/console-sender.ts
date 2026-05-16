import type { EmailMessage, EmailSender } from "./sender";

export class ConsoleEmailSender implements EmailSender {
  async sendVerification(msg: EmailMessage): Promise<void> {
    this.write("VERIFY EMAIL", msg);
  }

  async sendPasswordReset(msg: EmailMessage): Promise<void> {
    this.write("RESET PASSWORD", msg);
  }

  private write(label: string, msg: EmailMessage) {
    const lines = [
      "",
      "==================== EMAIL (console transport) ====================",
      `[${label}]`,
      `  to:  ${msg.to}`,
      `  url: ${msg.url}`,
      "===================================================================",
      "",
    ];
    process.stderr.write(`${lines.join("\n")}\n`);
  }
}
