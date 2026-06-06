import { NicheService } from './niche.service';
import { AnalyzeNicheDto } from './dto/niche.dto';
export declare class NicheController {
    private niche;
    constructor(niche: NicheService);
    analyze(dto: AnalyzeNicheDto): Promise<import("./niche.service").NicheAnalysis>;
}
