import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ElButton } from 'element-plus';

describe('Button 组件测试', () => {
  it('按钮渲染正确的文本', () => {
    const wrapper = mount(ElButton, {
      props: {
        type: 'primary'
      },
      slots: {
        default: '测试按钮'
      }
    });
    
    expect(wrapper.text()).toBe('测试按钮');
    expect(wrapper.classes()).toContain('el-button--primary');
  });
  
  it('按钮点击事件正常触发', async () => {
    const wrapper = mount(ElButton);
    
    await wrapper.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('click');
  });
});