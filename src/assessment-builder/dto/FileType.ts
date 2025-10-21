import { registerEnumType } from "@nestjs/graphql";

export enum FileType {
    PDF = "pdf",
    DOC = "doc",
    XLSX = 'xlsx',
    PNG = 'png',
    JPEG = 'jpeg'
  }

  registerEnumType(FileType, {
    name: 'FileType',
    description: 'Supported File Types.',
  });