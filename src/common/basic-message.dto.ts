
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BasicMessageDto {
    constructor(message: string) {
      this.message = message;
    }

    @ApiPropertyOptional({})
    private message: string;
  }
  