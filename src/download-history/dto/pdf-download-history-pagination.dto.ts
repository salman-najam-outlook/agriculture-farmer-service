import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { PdfDownloadHistory } from "../entities/pdf-download-history.entity";

@InputType()
export class PdfDownloadHistoryPaginationDTO {
    @Field(() => Int)
    page: number

    @Field(() => Int)
    limit: number

    @Field(() => String, { nullable: true })
    search?: string;
}

@ObjectType()
export class PdfDownloadHistoryResult {
    @Field(() => [PdfDownloadHistory])
    rows: PdfDownloadHistory[];

    @Field(() => Int)
    count: number;

    @Field(() => Int)
    totalCount: number;
}