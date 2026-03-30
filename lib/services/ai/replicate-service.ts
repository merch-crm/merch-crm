import Replicate from "replicate";
import { env } from "@/lib/env";

export class ReplicateService {
  private static instance: ReplicateService;
  private replicate: Replicate | null = null;

  private constructor() {
    if (env.REPLICATE_API_TOKEN) {
      this.replicate = new Replicate({
        auth: env.REPLICATE_API_TOKEN,
      });
    }
  }

  public static getInstance(): ReplicateService {
    if (!ReplicateService.instance) {
      ReplicateService.instance = new ReplicateService();
    }
    return ReplicateService.instance;
  }

  /**
   * Удаляет фон с изображения
   */
  async removeBackground(imageUrl: string): Promise<string> {
    if (!this.replicate) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    // lucataco/remove-bg
    const output = await this.replicate.run(
      "lucataco/remove-bg:95fce2005a3ba8fdf0bca9788f8d68f6a9c735d1a58d5119934f0393cf0278e3",
      {
        input: {
          image: imageUrl,
        },
      }
    );

    if (Array.isArray(output)) {
      return output[0] as unknown as string;
    }
    return output as unknown as string;
  }

  /**
   * Увеличивает разрешение изображения (4x Upscale)
   */
  async upscaleImage(imageUrl: string): Promise<string> {
    if (!this.replicate) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    // xinntao/realesrgan
    const output = await this.replicate.run(
      "xinntao/realesrgan:dc644901083F0eF4C1B69BA54E6097576E1A8A8A1C0A9788f8d68f6a9c735d1a58d51",
      {
        input: {
          image: imageUrl,
          upscale: 4,
          face_enhance: true,
        },
      }
    );

    if (Array.isArray(output)) {
      return output[0] as unknown as string;
    }
    return output as unknown as string;
  }
}
