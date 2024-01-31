import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { ConfigFactory } from '@nestjs/config';

const env = process.env.ENV || 'local';
const CONFIG_YAML = `${env}.yaml`;

const loadYamlConfig: ConfigFactory<Record<string, any>> = () => {
  try {
    const rootPath = process.cwd(); // 프로젝트 루트 경로
    const yamlFile = readFileSync(
      join(rootPath, 'src', 'config', CONFIG_YAML),
      'utf8',
    );
    return yaml.load(yamlFile) as Record<string, any>;
  } catch (error) {
    console.error('Error loading YAML config:', error);
    return {};
  }
};

const configuration = {
  loadYamlConfig,
};

export default configuration;