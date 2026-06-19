import { PartialType } from '@nestjs/swagger';
import { CreateRoutineTemplateDto } from './create-routine-template.dto';

export class UpdateRoutineTemplateDto extends PartialType(CreateRoutineTemplateDto) {}
