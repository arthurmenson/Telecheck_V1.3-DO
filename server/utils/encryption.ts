import crypto from "crypto";

// Advanced encryption service for PHI data protection
export class EncryptionService {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly TAG_LENGTH = 16; // 128 bits
  private static readonly SALT_LENGTH = 32; // 256 bits

  // Generate a secure encryption key from password
  private static deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, "sha512");
  }

  // Encrypt sensitive health data
  static encryptPHI(
    data: string,
    password: string,
  ): {
    encrypted: string;
    salt: string;
    iv: string;
    tag: string;
  } {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(this.SALT_LENGTH);
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Derive encryption key
      const key = this.deriveKey(password, salt);

      // Create cipher
      const cipher = crypto.createCipher(this.ALGORITHM, key);
      cipher.setAAD(Buffer.from("PHI_DATA")); // Additional authenticated data

      // Encrypt data
      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");

      // Get authentication tag
      const tag = cipher.getAuthTag();

      return {
        encrypted,
        salt: salt.toString("hex"),
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
      };
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt PHI data");
    }
  }

  // Decrypt sensitive health data
  static decryptPHI(
    encryptedData: {
      encrypted: string;
      salt: string;
      iv: string;
      tag: string;
    },
    password: string,
  ): string {
    try {
      // Convert hex strings back to buffers
      const salt = Buffer.from(encryptedData.salt, "hex");
      const iv = Buffer.from(encryptedData.iv, "hex");
      const tag = Buffer.from(encryptedData.tag, "hex");

      // Derive decryption key
      const key = this.deriveKey(password, salt);

      // Create decipher
      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      decipher.setAAD(Buffer.from("PHI_DATA"));
      decipher.setAuthTag(tag);

      // Decrypt data
      let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt PHI data");
    }
  }

  // Generate secure hash for data integrity
  static generateHash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  // Verify data integrity
  static verifyHash(data: string, hash: string): boolean {
    const computedHash = this.generateHash(data);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
  }

  // Generate secure random tokens
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  // Encrypt file data
  static encryptFile(
    fileBuffer: Buffer,
    password: string,
  ): {
    encrypted: Buffer;
    salt: string;
    iv: string;
    tag: string;
  } {
    try {
      const salt = crypto.randomBytes(this.SALT_LENGTH);
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const key = this.deriveKey(password, salt);

      const cipher = crypto.createCipher(this.ALGORITHM, key);
      cipher.setAAD(Buffer.from("FILE_DATA"));

      const encrypted = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final(),
      ]);

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        salt: salt.toString("hex"),
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
      };
    } catch (error) {
      console.error("File encryption error:", error);
      throw new Error("Failed to encrypt file");
    }
  }

  // Decrypt file data
  static decryptFile(
    encryptedData: {
      encrypted: Buffer;
      salt: string;
      iv: string;
      tag: string;
    },
    password: string,
  ): Buffer {
    try {
      const salt = Buffer.from(encryptedData.salt, "hex");
      const iv = Buffer.from(encryptedData.iv, "hex");
      const tag = Buffer.from(encryptedData.tag, "hex");
      const key = this.deriveKey(password, salt);

      const decipher = crypto.createDecipher(this.ALGORITHM, key);
      decipher.setAAD(Buffer.from("FILE_DATA"));
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(encryptedData.encrypted),
        decipher.final(),
      ]);

      return decrypted;
    } catch (error) {
      console.error("File decryption error:", error);
      throw new Error("Failed to decrypt file");
    }
  }

  // Generate encryption key pair for asymmetric encryption
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    return { publicKey, privateKey };
  }

  // Encrypt with public key (for key exchange)
  static encryptWithPublicKey(data: string, publicKey: string): string {
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(data));
    return encrypted.toString("base64");
  }

  // Decrypt with private key
  static decryptWithPrivateKey(
    encryptedData: string,
    privateKey: string,
  ): string {
    const decrypted = crypto.privateDecrypt(
      privateKey,
      Buffer.from(encryptedData, "base64"),
    );
    return decrypted.toString("utf8");
  }

  // HIPAA-compliant data anonymization
  static anonymizeData(data: any): any {
    const anonymized = JSON.parse(JSON.stringify(data));

    // Remove or hash personally identifiable information
    if (anonymized.firstName)
      anonymized.firstName = this.hashPII(anonymized.firstName);
    if (anonymized.lastName)
      anonymized.lastName = this.hashPII(anonymized.lastName);
    if (anonymized.email) anonymized.email = this.hashPII(anonymized.email);
    if (anonymized.phone) anonymized.phone = this.hashPII(anonymized.phone);
    if (anonymized.address)
      anonymized.address = this.hashPII(anonymized.address);
    if (anonymized.ssn) delete anonymized.ssn;

    // Add anonymization metadata
    anonymized._anonymized = true;
    anonymized._anonymizedAt = new Date().toISOString();

    return anonymized;
  }

  private static hashPII(value: string): string {
    return crypto
      .createHash("sha256")
      .update(value + "SALT_FOR_PII")
      .digest("hex")
      .substring(0, 8);
  }

  // Secure data comparison without revealing actual values
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  // Generate HIPAA-compliant audit trail hash
  static generateAuditHash(auditData: any): string {
    const auditString = JSON.stringify(
      auditData,
      Object.keys(auditData).sort(),
    );
    return crypto.createHash("sha512").update(auditString).digest("hex");
  }
}
